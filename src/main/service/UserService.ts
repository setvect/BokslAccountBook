import log from 'electron-log';
import AppDataSource from '../config/AppDataSource';
import { UserEntity } from '../entity/Entity';

// eslint-disable-next-line import/prefer-default-export
export async function createUser() {
  console.log('########################');
  const userRepository = AppDataSource.getRepository(UserEntity);
  const user = userRepository.create({
    userId: 'test',
    name: '테스트',
    passwd: 'test',
  });

  await userRepository.save(user);
  return user;
}

export async function findUser() {
  const userRepository = AppDataSource.getRepository(UserEntity);
  const userList = await userRepository.find();
  log.info('@@@ find user', userList);
  return userList;
}
