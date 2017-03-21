import Like from '../model';
import * as _ from 'lodash';
import { isValidPhoto, isValidUser } from '../utils';
export default async (msg, reply) => {
  const {userId, photoId} = msg;
  // define choice 
  // 0: error, no retrieve
  // 1: retrieve list of likes by userId
  // 2: retrieve list of likes by photoId
  // 3: retrieve ONE like by userId and photoId
  let choice = 0;
  if (!_.isUndefined(userId)){
    try{
      await isValidUser(userId);
      choice += 1;
    } catch(e){
      reply(e, null);
    }
  }
  if (!_.isUndefined(photoId)){
    try{
      await isValidPhoto(photoId);
      choice += 2;
    } catch(e){
      reply(e, null);
    }
  }

  let res;
  switch(choice){
    case 1: res = await Like.retrieveByUserId(userId); 
            reply(null, { likes: res });
            break;
    case 2: res = await Like.retrieveByPhotoId(photoId);
            reply(null, { likes: res });
            break;
    case 3: res = await Like.retrieveUniquelyByQuery({userId, photoId});
            reply(null, { likes: res });
            break;
    default: reply(null, null);
  }
};