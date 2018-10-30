import redis
import linear_regression as lr
import json
# Prod
# redis_db = redis.from_url("REDIS URL")

# Dev
# redis_db = redis.StrictRedis(host='localhost', port=6379, db=0)
redis_db = redis.StrictRedis(host='172.17.0.2', port=6379, db=0)

data = json.loads(redis_db.get('data'))
output = lr.prediction(data)
redis_db.set('result', output)
