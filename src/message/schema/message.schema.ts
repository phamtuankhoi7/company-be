import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/user/schema/user.schema';

export type MessageDocument = HydratedDocument<Message>;

@Schema({
  timestamps: true,
})
export class Message {
  @Prop()
  message: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }] })
  users: User[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  from: User;

  @Prop({ default: false })
  seen: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
