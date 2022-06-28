import pandas as pd
import numpy as np
import json
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.manifold import TSNE
from sklearn.metrics import silhouette_score

def kmeans_cluster(_year = ["2019"],_socio = ["15-64","65-100","00-14","Male","Female"], _code = [], _n = 4, _absolute = 1, _disorders = ["Depressive", "Anxiety", "Bipolar", "Eating", "Schizophrenia", "Attention", "Conduct", "intellectualDisability", "Autism"]):

    #The number of countries is less than the number of cluster
    if _n > len(_code) and len(_code) != 0:
        return {}

    #Read the csv with socio-economic data
    df_socio = pd.read_csv('/home/SerFelix/Visual_Analytics/static/dataset/socio_economicDB1.csv')
    df_socio = df_socio.drop(columns=['Unnamed: 0',"Rural population","Urban population"])
    df_socio = df_socio.rename(columns={'Population ages 15-64, total': "15-64","Population ages 65 and above, total": "65-100", "Population ages 00-14, total":"00-14"})
    df_socio = df_socio.rename(columns={"Name": "Entity"})

    #Read the csv with mental disorders data
    df_mental = pd.read_csv('/home/SerFelix/Visual_Analytics/static/dataset/Mental_Disorder_with_continent.csv')
    df_mental = df_mental.drop(columns=['Unnamed: 0'])
    columns = ["Entity", "Code", "Year"]
    df_mental = df_mental[columns + _disorders]

    #Read the csv with mental disorders data about sex
    df_sm = pd.read_csv('/home/SerFelix/Visual_Analytics/static/dataset/Mental_Disorder_sex.csv')
    df_sm = df_sm.drop(columns=['Unnamed: 0', 'Continent'])
    df_sm = df_sm.rename(columns={"Prevalence - Mental disorders - Sex: Male - Age: Age-standardized (Percent)": "Male", "Prevalence - Mental disorders - Sex: Female - Age: Age-standardized (Percent)":"Female"})
    df_sm = df_sm.dropna()

    #Join the two datasets about socio and sex
    df_join1 = pd.merge( df_socio,df_sm,  how='left', left_on=['Code', 'Year'], right_on = ['Code', 'Year'])
    df_join1 = df_join1.dropna()

    #Clean the columns for the variable _socio
    columns = ["Entity_y", "Code", "Year", "Current health expenditure", "Population, total"]
    if len(_socio) != 0:
      df_join1 = df_join1[columns + _socio]

    #Merge all the databases
    df = pd.merge(df_join1,df_mental,  how='left', left_on=['Code', 'Year'], right_on = ['Code', 'Year'])

    #Compute the percentage of Female and Male with disorders
    df['Tot']= df[_disorders].sum(axis=1)
    s = ["Male","Female"]
    df = df.apply(lambda x: ((x*df['Tot'])/100) if x.name in s else x)

    #Clean and take only some countries
    if len(_code) != 0:
        df = df.loc[df['Code'].isin(_code)]

    #Take only some years  and compute the mean with the code
    df = df.loc[df['Year'].isin(_year)]
    df = df.groupby(['Code'], as_index=False).mean()
    df = df.reset_index().drop(columns=["index"])

    #Compute the values for 100k
    if(_absolute == 1):
        socio_info = ["00-14","15-64","65-100","Male","Female"]
        df = df.apply(lambda x: ((x/df['Population, total'][x.index])*100000) if x.name in (socio_info + _disorders) else x)

    #Prepare the dataset for the t-SNE
    df_pre = df.drop(columns=['Year','Code','Population, total'])
    df_pre = df_pre.reset_index().drop(columns=["index"])

    #Standardize features by removing the mean and scaling to unit variance
    scaler = StandardScaler()
    scaler.fit(df_pre)
    X_scale = scaler.transform(df_pre)

    #Preprocessing data with t-SNE
    tsne = TSNE(n_components=2, verbose=1, random_state=42)#(n_components=2, verbose=1, perplexity=40, n_iter=5000)
    tsne_scale_results = tsne.fit_transform(X_scale)
    tsne_df_scale = pd.DataFrame(tsne_scale_results, columns=['tsne1', 'tsne2'])

    #K-Means
    kmeans_tsne_scale =KMeans(n_clusters=_n, n_init=100, max_iter=400, init='k-means++', random_state=42).fit(tsne_df_scale)
    #print('KMeans tSNE Scaled Silhouette Score: {}'.format(silhouette_score(tsne_df_scale, kmeans_tsne_scale.labels_, metric='euclidean')))

    labels_tsne_scale = kmeans_tsne_scale.labels_
    clusters_tsne_scale = pd.concat([tsne_df_scale, pd.DataFrame({'tsne_clusters':labels_tsne_scale})], axis=1)
    clusters_tsne_scale.columns = ['tsn1', 'tsn2','ClusterID']
    print(clusters_tsne_scale['ClusterID'].value_counts())

    final_data = pd.merge(df,clusters_tsne_scale, left_index=True,right_index=True)
    final_data = final_data[["Code","tsn1","tsn2","ClusterID"]]
    #final_data.to_csv('/home/SerFelix/Visual_Analytics/static/dataset/kmeans.csv',index=False)
    #with open('/home/SerFelix/Visual_Analytics/static/dataset/kmeans.json', 'w', encoding='utf-8') as f:
        #json.dump(final_data.to_json(orient='table',index=False), f, ensure_ascii=False, indent=4)

    return final_data.to_json(orient='table',index=False)


