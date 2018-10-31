import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Process from 'child_process';
import redis from 'redis';
// Components
import DataObject from './data.mjs';

const Data = new DataObject();

// Prod
// const store = redis.createClient('Redis URL');
// Dev
const store = redis.createClient('redis://localhost:6379');
// const store = redis.createClient('redis://172.17.0.2:6379');

store.on('error', (err) => {
    console.log('🚨 ', err.message);
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('src'));
app.post('/model', async (req, res) => {
    if (req.body) {
        const data = await Data.get(req.body.query);
        if (!!data) {
            store.set('data', JSON.stringify(data));
            const sh = async (cmd) => {
                return new Promise(function(resolve, reject) {
                    Process.exec(cmd, (err, stdout, stderr) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ stdout, stderr });
                        }
                    });
                });
            };
            await sh('python3 ./ml/main.py')
                .then((output) => {
                    console.log(output.stdout);
                    store.get('result', (err, reply) => {
                        res.json(
                            reply
                                .replace('[', '')
                                .replace(']', '')
                                .replace(1, reply.length - 3)
                        );
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            res.json('[No Data]');
        }
    } else {
        res.statusCode = 400;
        res.end();
    }
});
app.get('*', (req, res) => {
    res.statusCode = 404;
    res.end();
});

app.listen(process.env.PORT || 8080, () =>
    console.log(`App Server Ready! Port: ${process.env.PORT | 8080}`)
);
