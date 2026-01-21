import { Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup-dto';
import { LoginDto } from './dto/login-dto';
import { InjectModel } from '@nestjs/sequelize';
import { PlayerModel } from 'database';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(PlayerModel)
    private playerModel: typeof PlayerModel,
    private jwtService: JwtService
  ) {}

  async create(signupDto: SignupDto) {
     const hashedPassword = await bcrypt.hash(signupDto.password, 10);
     return this.playerModel.create({name: signupDto.name, email: signupDto.email, password: hashedPassword,avatarId: signupDto.avatarId});
     
  }


  async login(loginDto: LoginDto) {
    const rec = await this.playerModel.findOne({ where: { email: loginDto.email } });
    const player = rec?.dataValues;

    
     
    if (!player) {
      throw new Error('Player not found');
    }
  
    const isPasswordValid = await bcrypt.compare(loginDto.password, player.password);
    if (!isPasswordValid) {
      //console.log("invalid password for player:",player.email);
      throw new Error('Invalid password');
    }

    const payload = { userId: player.id, email: player.email};
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: player
    };
  }
}