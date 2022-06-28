import json
from kmeans import *
import flask
from flask import Flask, render_template, request
from flask_cors import CORS, cross_origin

#{"year":[2010,2011],"n":3,"type": "countries","code":["ITA"]}

# Initialise app: create a new Flask application
app = Flask(__name__)
cors = CORS(app, resources={
        r"/*": {
            "origins":"*"
        }
    })


#Run the clusters
#@cross_origin()
@app.route('/clusters', methods = ['POST','GET'])
def getClusters():
    if request.method == "GET":
        #response = flask.jsonify(kmeans_cluster())
        #response.headers.add('Access-Control-Allow-Origin', '*')
        #return response
        return kmeans_cluster()

    if request.method == "POST":
        record = json.loads(request.data)
        return kmeans_cluster(record["year"],record["socio"],record["code"],record["n"],record["absolute"],record["disorders"])


@app.route('/')
def index():
    return render_template('index.html')

if (__name__ == '__main__'):
    app.run()