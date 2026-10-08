const VERSION = '0.1.1';
const VERSION_STRING = `${VERSION} (${process.env.APP_BUILD_DATE ?? '개발 빌드'})`;

const DEFAULT_USER = {
  userId: 'boksl',
  passwd: 'boksl',
  name: '복슬이',
};

const Constant = {
  VERSION,
  VERSION_STRING,
  DEFAULT_USER,
};

export default Constant;
