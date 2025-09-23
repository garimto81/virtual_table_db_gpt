import { VirtualTableDB } from './index';

describe('VirtualTableDB', () => {
  let app: VirtualTableDB;

  beforeEach(() => {
    app = new VirtualTableDB();
  });

  describe('greeting', () => {
    it('should return greeting message with name', () => {
      const result = app.greeting('테스터');
      expect(result).toBe('안녕하세요, 테스터님! Virtual Table DB에 오신 것을 환영합니다.');
    });

    it('should throw error when name is empty', () => {
      expect(() => app.greeting('')).toThrow('Name is required');
    });

    it('should throw error when name is null', () => {
      expect(() => app.greeting(null as any)).toThrow('Name is required');
    });

    it('should throw error when name is whitespace only', () => {
      expect(() => app.greeting('   ')).toThrow('Name is required');
    });
  });

  describe('getVersion', () => {
    it('should return current version', () => {
      const version = app.getVersion();
      expect(version).toBe('13.3.4-stable');
    });
  });
});