# Mental Healt Analyzer
Group project for Visual Analytics Master's Course 2021-2022 at Sapienza Università di Roma.

### Team members
Daniela Moretti ([danymrt](https://github.com/danymrt))

Felice Massotti ([Felixmassotti](https://github.com/Felixmassotti))

## Overview
Visual Analytics has a great potential to support the whole healthcare system, such as decision support in clinical medicine and also in the public health sector. 
In our project *MentalHealthAnalyzer*, we are going to analyzing the correlation between Mental Health disorders and some sociodemographic data to find common patterns
and behaviors in different countries around the world in a , so that anyone, such as pharmaceutical companies or even charities, can target and accurately intervene.
We focus on nine mental disorders and three main categories are examined, namely the age of the population, the genre, and the capital expenditure of GDP. 
These will be analyzed in the context of countries and in the time frame from 2010 to 2019.

## Description
The datasets of our project can be divided into two macro-categories: the part relating to mental health data and the part relating to socio-demographic data.
* For the first, we took the csv called *Number with a mental or neurodevelopmental disorder by type* on the Our World in Data website. Inside it, there are the numbers of the population of each country
in the world suffering of a certain mental disorder. The categories analyzed are nine and include: anxiety disorder, depressive disorder, 
developmental intellectual disability, attention-deficit/hyperactive disorder, conduct disorder, bipolar disorder, autism spectrum disorder, schizophrenia and 
eating disorder.
* Two datasets were used to represent the socio-demographic elements.
  * The first was taken from the previous website and is called *Prevalence of mental health disorders in men vs. women*. It contains the percentages of men and women with any mental health or development disability disorder for each country.
  * The second was taken by World Bank Data in the *Health Nutrition and Population Statistic category*. The categories we took are: Level of current health expenditure expressed as a percentage of GDP, 
    total population, population ages 00-14, population ages 15-64 and population ages 65 and above.


With regard to support public health professionals, we need to find some visual analytics solutions that are easy to be analyzed and understood. 
This is achieved thanks to the use of interactive and adaptive visual interfaces that enable filtering to handle the amount of information to be displayed.
For this purpose, we realized six types of visualizations:
* **Disorders mapping**: this is a choropleth map to get an initial view of the distribution of these disorders;
* **Parallel coordinates**: useful to find patterns and trends, analyze disorders for each country and also confront the values over time;
* **Bar chart**: for comparing the population categories(ages and genre);
* **Line chart**: for a complete overview of how the percentage of GDP changes over the years;
* **Scatter Plot**: useful to find possible clusters among countries;

The menu is composed of two selection options and a slider. The first selection is used to choose if doing an analysis considering the number of disorders related to 
a sample of 100.000 citizens for each country, while the second option takes the total population. 
The second select is used to filter the disorders that we want to analyze, so the clusters are computed based on the checked disorders. 
The slight bar instead is used to choose the range of years that we want to take into consideration, also here when it changes the clusters are recalculated. 
Finally, there is a lateral slider bar that is a list of all countries sorted by the sum of all the checked disorders in the selected range of years. 
It shows 10 countries at time and with a fixed brush is possible to scroll between the countries. According to it, all the other visualization are adapted.

For the analytical part, we have tried to create clusters that group different countries, to find similarities and differences that can help the user analysis.
In order to do this, the first important thing, given the large amount of data, is dimensionality reduction through t-SNE and then applies K-Means to them.
This whole part was created on PythonAnywhere a web hosting service (PaaS) which allows to develop and run a Python back-end service that is active always. 
The service implements RESTful API which, through POST and GET calls, returns the data elaborated. To develop it, a Flask framework was used. 

For more details, there is the complete [report](https://github.com/danymrt/Visual-Analytics/blob/master/VA_Report.pdf).

![total](https://user-images.githubusercontent.com/33021786/176146967-0a83f14a-6986-46c2-b1ee-9fea60d91c36.jpg)


## Setting up
For the setup of the project it will be necessary: 
* Download all the files except for the Analytic folders
* Open the index.html with Firefox browser
