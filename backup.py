import sqlite3
from flask import Flask
from flask import jsonify
from flask import Response
from flask import request

from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper


def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator



app = Flask(__name__)

@app.route("/<state>/<year>/<patClass>")

@crossdomain(origin='*')
def patent(state, year, patClass):
      print state
      import json
      conn = sqlite3.connect('/Users/kevshin2/d3js_projects/webserver/invpat.sqlite3')
      c = conn.cursor()
      c.execute('''
          select Patent, Longitude, Latitude from invpat where State = "{state}" AND AppYear = {year} AND Class LIKE "{patClass}"%;
        '''.format(state=state, year=year, patClass=patClass))
      # select count(*) as cnt, Longitude, Latitude from invpat where State = "{state}" and AppYear = {year} GROUP BY Longitude, Latitude;
      # select Patent, Longitude, Latitude from invpat where State = "{state}" and AppYear = {year} limit 15000;
      '''select count(*), longitude, latitude FROM (
        select Patent, Longitude, Latitude from invpat where State = "{state}" and AppYear = {year}
        ) as a 
        GROUP BY longitude,latitude
      '''
      results = c.fetchall()
      #d = results
      d = dict(zip([x[0] for x in results],[x[1:] for x in results]))
     
      jsonout = json.dumps(d, indent=4)
      if 'callback' in request.args:
        jsonout = "{callback}({json})".format(callback=request.args["callback"], json=jsonout)
      elif 'jsonp' in request.args:
        jsonout = "{callback}({json})".format(callback=request.args["jsonp"], json=jsonout)
      return Response(jsonout, mimetype="application/json")
      #return jsonout

# @app.route('/<statename>')
# def patent(statename):
#   import json
#   # put your sql query here
#   # change it to json
#   conn = sqlite3.connect('/Users/kevshin2/d3js_projects/webserver/invpat.sqlite3')
#   c = conn.cursor()
#   print statename
#   c.execute('''select Patent, Latitude, Longitude from invpat where State = "{statename}" limit 100;'''.format(statename=statename))
#   results = c.fetchall()
#   print results
#   d = dict(zip([x[0] for x in results],[x[1:] for x in results]))
#   c = None
#   conn = None
#   return d


if __name__ == "__main__":
    app.run(debug=True)

    
