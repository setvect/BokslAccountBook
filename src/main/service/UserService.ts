import bcrypt from 'bcrypt';
import AppDataSource from '../config/AppDataSource';
import UserRepository from '../repository/UserRepository';

export default class UserService {
  private static userRepository = new UserRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  static async changePassword(userId: string, currentPassword: string, changePassword: string): Promise<void> {
    const userEntity = await this.userRepository.repository.findOne({ where: { userId } });
    if (!userEntity) {
      throw new Error('존재하지 않는 사용자입니다.');
    }

    if (!bcrypt.compareSync(currentPassword, userEntity.passwd)) {
      throw new Error('기존 비밀번호가 일치하지 않습니다.');
    }

    userEntity.passwd = bcrypt.hashSync(changePassword, 10);
    await this.userRepository.repository.save(userEntity);
  }

  static async checkPassword(userId: string, password: string): Promise<boolean> {
    const userEntity = await this.userRepository.repository.findOne({ where: { userId } });
    if (!userEntity) {
      throw new Error('존재하지 않는 사용자입니다.');
    }
    return bcrypt.compareSync(password, userEntity.passwd);
  }
}
