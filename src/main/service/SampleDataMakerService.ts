import fs from 'fs';
import log from 'electron-log';
import path from 'path';
import { app } from 'electron';
import { Repository } from 'typeorm';
import AppDataSource, { closeConnection, initConnection } from '../config/AppDataSource';
import Constant from '../../common/Constant';
import DbInitService from './DbInitService';
import AccountRepository from '../repository/AccountRepository';
import BalanceRepository from '../repository/BalanceRepository';

export default class SampleDataMakerService {
  private static accountRepository = new AccountRepository(AppDataSource);

  private static balanceRepository = new BalanceRepository(AppDataSource);

  static async makeSampleData(backupDbFilePath: string) {
    await closeConnection();
    SampleDataMakerService.backupDb(backupDbFilePath);
    await initConnection();

    // 기본적인 데이터 생성
    await DbInitService.initDbData();

    await this.initAccount();
    await this.initBalance();
  }

  static async initAccount() {
    await this.initDataFromFile('../assets/sample_data/BA_ACCOUNT.json', this.accountRepository.repository, 'Account');
  }

  static async initBalance() {
    await this.initDataFromFile('../assets/sample_data/BB_BALANCE.json', this.balanceRepository.repository, 'Balance');
  }

  static async initDataFromFile(filePath: string, repository: Repository<any>, name: string) {
    const dataList = this.loadJson(filePath);
    const promises = dataList.map((data: any) => repository.save(repository.create(data)));
    await Promise.all(promises);
    const count = await repository.count();
    log.info(`총 ${count}개의 ${name}가 생성되었습니다.`);
  }

  private static loadJson(paths: string) {
    const filePath = path.join(__dirname, paths);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  private static backupDb(backupDbFilePath: string) {
    const src = path.join(app.getAppPath(), Constant.DB_PATH);
    const dest = path.join(app.getAppPath(), backupDbFilePath);
    const exist = fs.existsSync(src);
    if (!exist) {
      log.error(`DB 파일이 존재하지 않습니다: ${src}`);
      return;
    }
    fs.renameSync(src, dest);
    log.info(`DB 백업 완료: ${backupDbFilePath}`);
  }
}
