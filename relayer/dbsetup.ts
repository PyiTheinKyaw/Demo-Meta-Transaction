import db from './src/models';

async function setup(isReset: boolean){
    db.sequelize.sync({force: isReset}).then(() => {
        console.log('done')
    });
}
setup(true);
