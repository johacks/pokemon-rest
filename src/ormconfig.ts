import { MongooseModuleOptions } from '@nestjs/mongoose';

export const ormConf: MongooseModuleOptions = {
  // uri: 'mongodb+srv://pokemon-db.5r0lxid.mongodb.net/pokemon-db',
  user: 'codeEvaluatorUser',
  // Normally use env variable in production
  pass: 'thQcQd8GqRRetoo9',
};
