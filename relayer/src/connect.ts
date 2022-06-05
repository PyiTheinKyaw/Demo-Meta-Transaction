import mongoose from 'mongoose';

type TDBInput = {
  db: string;
};

export default ({ db }: TDBInput) => {
  const connect = () => {
    mongoose
      .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      })
      .then(() => {
        return console.info(`Successfully connected to Database`);
      })
      .catch((error) => {
        console.error('Error connecting to database: ', error);
        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on('disconnected', connect);
};
