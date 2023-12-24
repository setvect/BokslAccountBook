import log from 'electron-log';
import AppDataSource from '../config/AppDataSource';
import UserRepository from '../repository/UserRepository';

export default class UserService {
  private static userRepository = new UserRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  static async createUser() {
    const user = this.userRepository.repository.create({
      userId: 'test',
      name: '테스트',
      passwd: 'test',
    });

    await this.userRepository.repository.save(user);
    return user;
  }

  static async findUser() {
    const userList = await this.userRepository.repository.find();
    log.info('@@@ find user', userList);
    return userList;
  }
}
