import express, { NextFunction } from 'express';
import * as core from 'express-serve-static-core';
var cors = require('cors');
import * as bodyParser from 'body-parser';
import ControllerInterface from './src/controllers/interfaces/controllerInterface';

class App {
    public app: core.Express;
    public port: number;

    constructor(
        relayControllers: ControllerInterface[],
        port: number
    ) {
        this.app = express();
        this.port = port;

        this.initializeMiddlewares();
        this.initializeControllers(relayControllers);
        this.initializeErrorApi();
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser.json());
        this.app.options('*', cors());
        this.app.use(cors());
    }

    private initializeErrorApi(){
        this.app.use(async (request: express.Request, response: express.Response, next: NextFunction) => {
            let resObj = {
                code: 1,
                message: "The requested API is not valid."
            };
            
            return response.json(resObj);
        })
    }

    private initializeControllers(
        relayerControllers: ControllerInterface[]
    ) {
        relayerControllers.forEach((relayerControllers) => {
            this.app.use('/api/v1/relayer/', relayerControllers.router);
        });
    }

    public async listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }
}
  
export default App;
