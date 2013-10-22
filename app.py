import sqlite3
import csv
import sys
import os
import json
import re
from flask import Flask, redirect, url_for, Response,  make_response, request, current_app
from werkzeug import secure_filename
from datetime import timedelta
from functools import update_wrapper
from flask import render_template

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

@app.route('/index')
def hello(name=None):
    return render_template('gabe.html')

@app.route("/api/<state>/<year>/<cla>")
def patent(state, year, cla):
      print state
      import json
      conn = sqlite3.connect('/data/patentdata/LATEST/invpat.sqlite3')
      c = conn.cursor()
      if state == "empty" and cla == "empty":
          print "not here"
          c.execute('''
            select Patent, Longitude, Latitude, Lastname, Firstname, Assignee from invpat where Country = "US" AND AppYear = {year} limit 35000;
          '''.format(year=year))
          
      elif state == "empty" and cla != "empty":
          print "here"
          c.execute('''
            select Patent, Longitude, Latitude, Lastname, Firstname, Assignee from invpat where Country = "US" AND AppYear = {year} AND Class like "{cla}/%" limit 35000;
          '''.format(year=year, cla=cla))
      elif cla != "empty":
         c.execute('''
            select Patent, Longitude, Latitude, Lastname, Firstname, Assignee from invpat where State = "{state}" AND AppYear = {year} And Class like "{cla}/%" limit 30000;
          '''.format(state=state, year=year, cla=cla))
         #;
         #select Patent, Latitude, Longitude, count(*) from (select * from invpat where State = "{state}" and AppYear = {year} And Class like "{cla}/%") group by Latitude, Longitude limit 200;
      else :
          c.execute('''
            select Patent, Longitude, Latitude, Lastname, Firstname, Assignee from (select * from (select * from invpat where State = "{state}") where AppYear = {year});
                  '''.format(state=state, year=year))
      #
      #select Patent, Longitude, Latitude from (select * from invpat where State = "{state}" and AppYear = {year}) group by Latitude, Longitude;
      results = c.fetchall()
      d = dict(zip([x[0] for x in results],[x[1:] for x in results]))
      jsonout = json.dumps(d, indent=4)
      if 'callback' in request.args:
        jsonout = "{callback}({json})".format(callback=request.args["callback"], json=jsonout)
      elif 'jsonp' in request.args:
        jsonout = "{callback}({json})".format(callback=request.args["jsonp"], json=jsonout)
      return Response(jsonout, mimetype="application/json")

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in 'txt'

@app.route("/upload/", methods=['POST'])
def upload_file():
    print request
    file = request.files['file']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        print filepath
        file.save(filepath)
        return parse(filepath)

def parse(filename):
  f = open(filename, 'rb')
  conn = sqlite3.connect('/data/patentdata/LATEST/invpat.sqlite3')
  c = conn.cursor()
  results = []
  for line in f:
    line = line.strip()
    c.execute('''
      select Patent, Longitude, Latitude, Lastname, Firstname, Assignee from invpat where Patent = "0{pat}";
      '''.format(pat=line))
    results += c.fetchall()
  d = dict(zip([x[0] for x in results],[x[1:] for x in results]))
  jsonout = json.dumps(d, indent=4)
  if 'callback' in request.args:
    jsonout = "{callback}({json})".format(callback=request.args["callback"], json=jsonout)
  elif 'jsonp' in request.args:
    jsonout = "{callback}({json})".format(callback=request.args["jsonp"], json=jsonout)
  return Response(jsonout, mimetype="application/json")


if __name__ == "__main__":
    app.run(host='0.0.0.0',debug=True)
