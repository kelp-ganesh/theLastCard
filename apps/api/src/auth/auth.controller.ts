import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup-dto';
import { LoginDto } from './dto/login-dto';
import type { Request, Response } from "express";
import { ACCESS_TOKEN_MAX_AGE } from '../../constants';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    try
  {  
   const player= this.authService.create(signupDto);
   
  }
  catch (error){
    console.error('Error creating user:', error);
  }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto,@Res({ passthrough: true }) response: Response) {
    const {access_token,user} = await this.authService.login(loginDto);
    response.cookie("authToken", access_token, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });
    response.send({ access_token, user });
  }
}
