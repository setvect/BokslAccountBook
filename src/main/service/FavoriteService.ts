import AppDataSource from '../config/AppDataSource';
import { ResFavoriteModel } from '../../common/ResModel';
import FavoriteRepository from '../repository/FavoriteRepository';

export default class FavoriteService {
  private static favoriteRepository = new FavoriteRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  static async findAll(): Promise<ResFavoriteModel[]> {
    const favoriteList = await this.favoriteRepository.repository.find({
      where: {
        deleteF: false,
      },
      order: {
        orderNo: 'ASC',
      },
    });

    return favoriteList.map((favorite) => {
      return {
        favoriteSeq: favorite.favoriteSeq,
        title: favorite.title,
        categorySeq: favorite.categorySeq,
        kind: favorite.kind,
        note: favorite.note,
        currency: favorite.currency,
        amount: favorite.amount,
        payAccount: favorite.payAccount,
        receiveAccount: favorite.receiveAccount,
        attribute: favorite.attribute,
        orderNo: favorite.orderNo,
      } as ResFavoriteModel;
    });
  }

  static async updateOrder(updateInfo: { favoriteSeq: number; orderNo: number }[]) {
    const updatePromises = updateInfo.map((item) =>
      this.favoriteRepository.repository.update({ favoriteSeq: item.favoriteSeq }, { orderNo: item.orderNo }),
    );

    await Promise.all(updatePromises);
  }

  static async save(favoriteForm: ResFavoriteModel) {
    const orderNo = await this.favoriteRepository.getNextOrderNo(favoriteForm.kind);
    const entity = this.favoriteRepository.repository.create({
      title: favoriteForm.title,
      categorySeq: favoriteForm.categorySeq,
      kind: favoriteForm.kind,
      note: favoriteForm.note,
      currency: favoriteForm.currency,
      amount: favoriteForm.amount,
      payAccount: favoriteForm.payAccount,
      receiveAccount: favoriteForm.receiveAccount,
      attribute: favoriteForm.attribute,
      orderNo,
      deleteF: false,
    });
    await this.favoriteRepository.repository.save(entity);
  }

  static async update(favoriteForm: ResFavoriteModel) {
    const beforeData = await this.favoriteRepository.repository.findOne({ where: { favoriteSeq: favoriteForm.favoriteSeq } });
    if (!beforeData) {
      throw new Error('자주쓰는 거래를 찾을 수 없습니다.');
    }

    const updateData = {
      ...beforeData,
      title: favoriteForm.title,
      categorySeq: favoriteForm.categorySeq,
      kind: favoriteForm.kind,
      note: favoriteForm.note,
      currency: favoriteForm.currency,
      amount: favoriteForm.amount,
      payAccount: favoriteForm.payAccount,
      receiveAccount: favoriteForm.receiveAccount,
      attribute: favoriteForm.attribute,
    };

    await this.favoriteRepository.repository.save(updateData);
  }

  static async delete(favoriteSeq: number) {
    const beforeData = await this.favoriteRepository.repository.findOne({ where: { favoriteSeq } });
    if (!beforeData) {
      throw new Error('자주쓰는 거래를 찾을 수 없습니다.');
    }

    const updateData = {
      ...beforeData,
      deleteF: true,
    };

    await this.favoriteRepository.repository.save(updateData);
  }
}
