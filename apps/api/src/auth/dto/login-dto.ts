 
import { IsString, Min ,IsEmail} from 'class-validator';

export class LoginDto {
  
    
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @Min(6)
  password: string;
}