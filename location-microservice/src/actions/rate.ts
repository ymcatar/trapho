import * as _ from 'lodash';

import Location from '../model';

export default async (msg, reply) => {
    const {id, rating, photoID} = msg;
    if(typeof id == "undefined"){
        reply(new Error("invalidLocationIDError"), null);
        return;
    }
    if(typeof rating != "number"){
        reply(new Error("invalidRatingError"), null);
    }
    if(typeof photoID == "undefined"){
        reply(new Error("invalidPhotoIDError"), null);
    }
    const location: Location = await Location.retrieve({"_id": id})
    // TODO: Add logic to check validity of photoID
    if(location){
        if(typeof location.photoRated[photoID] != "undefined"){
            reply(new Error("AlreadyRatedError"), null);
            return;
        }
        location.rating = (location.rating*location.personRated+rating)/(location.personRated+1);
        location.personRated += 1;
        location.photoRated[photoID] = rating;
        try{
            let result = await location.update();
            reply(null, {rating: location.rating, personRated: location.personRated});
        }catch(e){
            reply(new Error("databaseError"), null);
        }
    }else{
        reply(new Error("invalidLocationIDError"), null);
    }
}