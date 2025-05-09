import BaseService from '../api-base/BaseService';

import type { LoginUserDto } from '../../Types/AuthTypes';

export default class LoginService {
  public static setAccessToken(accessToken: string) {
    localStorage.setItem('accessToken', accessToken);
  }

  public static getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  static async sendOtpEmail(email: string) {
    return BaseService.post<{ message: string }>('auth/login/verify-email', { email });
  }

  static async sendOtpMobile(mobile: string) {
    return BaseService.post<{ message: string }>('auth/login/verify-mobile', { mobile });
  }

  static async verifyOtpEmail(email: string, otp: string) {
    return BaseService.post<{ message: string }>('auth/login/verify-otp-email', { email, otp });
  }

  static async verifyOtpMobile(mobile: string, otp: string) {
    return BaseService.post<{ message: string }>('auth/login/verify-otp-mobile', { mobile, otp });
  }

  static async login(loginUserDto: LoginUserDto) {
    const response = await BaseService.post<{ access_token: string }>('auth/login', loginUserDto);
    console.log('API Response:', response);

    if (response.data?.access_token) {
      this.setAccessToken(response.data.access_token);
    }
    return response;
  }

}