import * as core from 'express-serve-static-core';

interface ControllerInterface {
    router: core.Router;
    intializeRoutes(): void;
}

export default ControllerInterface;
