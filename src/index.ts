import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

/**
 * Virtual Table DB 메인 엔트리포인트
 */
export class VirtualTableDB {
  private version: string = '13.3.4-stable';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    console.log(`🚀 Virtual Table DB v${this.version} 시작`);
    console.log(`📌 환경: ${process.env.NODE_ENV || 'development'}`);
  }

  /**
   * 인사말 함수 (테스트용)
   */
  public greeting(name: string): string {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    return `안녕하세요, ${name}님! Virtual Table DB에 오신 것을 환영합니다.`;
  }

  /**
   * 버전 정보 반환
   */
  public getVersion(): string {
    return this.version;
  }
}

// 직접 실행 시
if (require.main === module) {
  const app = new VirtualTableDB();
  console.log(app.greeting('개발자'));
}