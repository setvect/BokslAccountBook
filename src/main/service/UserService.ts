import User from '../entity/Entity';
import AppDataSource from '../config/AppDataSource';

// eslint-disable-next-line import/prefer-default-export
export async function createUser() {
  console.log('########################');
  const userRepository = AppDataSource.getRepository(User);
  const user = userRepository.create({
    userId: 'test',
    name: '테스트',
    passwd: 'test',
  });

  await userRepository.save(user);
  return user;
}
