import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import AppDataSource from '../config/AppDataSource';
import CategoryRepository from '../repository/CategoryRepository';
import UserRepository from '../repository/UserRepository';
import Constant from '../../common/Constant';
import CodeMainRepository from '../repository/CodeMainRepository';
import CodeItemRepository from '../repository/CodeItemRepository';
import { Repository } from 'typeorm';
import AccountRepository from '../repository/AccountRepository';
import BalanceRepository from '../repository/BalanceRepository';

/**
 * 최초 프로그램 실행 여부를 확인해 기본 데이터를 생성한다.
 */
export default class DbInitService {
  private static categoryRepository = new CategoryRepository(AppDataSource);

  private static userRepository = new UserRepository(AppDataSource);

  private static codeMainRepository = new CodeMainRepository(AppDataSource);

  private static codeItemRepository = new CodeItemRepository(AppDataSource);

  private static accountRepository = new AccountRepository(AppDataSource);

  private static balanceRepository = new BalanceRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  static async initDbData() {
    log.info('initDbData()');
    await this.initUser();
    await this.initCategory();
    await this.initCodeMain();
    await this.initCodeItem();
    await this.initAccount();
    await this.initBalance();
  }

  private static async initUser() {
    let count = await this.userRepository.repository.count();
    if (count !== 0) {
      log.info(`${count} 데이터 있음 초기화 하지 않음`);
      return;
    }
    const user = _.cloneDeep(Constant.DEFAULT_USER);
    user.passwd = bcrypt.hashSync(user.passwd, 10);

    await this.userRepository.repository.save(this.userRepository.repository.create(user));
    count = await this.userRepository.repository.count();
    log.info(`총 ${count}개의 사용자가 생성되었습니다.`);
  }

  static async initCategory() {
    await this.initDataFromFile('../assets/init_data/BC_CATEGORY.json', this.categoryRepository.repository, 'Category');
  }

  static async initCodeMain() {
    await this.initDataFromFile('../assets/init_data/ZA_CODE_MAIN.json', this.codeMainRepository.repository, 'CodeMain');
  }

  static async initCodeItem() {
    await this.initDataFromFile('../assets/init_data/ZB_CODE_ITEM.json', this.codeItemRepository.repository, 'CodeItem');
  }

  static async initAccount() {
    await this.initDataFromFile('../assets/init_data/BA_ACCOUNT.json', this.accountRepository.repository, 'Account');
  }

  static async initBalance() {
    await this.initDataFromFile('../assets/init_data/BB_BALANCE.json', this.balanceRepository.repository, 'Balance');
  }

  static async initDataFromFile(filePath: string, repository: Repository<any>, name: string) {
    const dataList = this.loadJson(filePath);

    let count = await repository.count();
    if (count !== 0) {
      log.info(`${count} ${name} 데이터 있음 초기화 하지 않음`);
      return;
    }

    const promises = dataList.map((data: any) => repository.save(repository.create(data)));

    await Promise.all(promises);
    count = await repository.count();
    log.info(`총 ${count}개의 ${name}가 생성되었습니다.`);
  }

  private static loadJson(paths: string) {
    const filePath = path.join(__dirname, paths);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
}
