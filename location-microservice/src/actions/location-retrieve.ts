import * as _ from 'lodash';
import Location from '../model';

export default async (msg, reply) => {

  const { locationId, query } = msg;
  let searchQuery: any = {};

  if (!_.isUndefined(locationId)) {
    try {
      let result = await Location.retrieveById(locationId);
      reply(null, { locations: result }); // just return one object
      return;
    } catch (e) {
      reply(e, null);
      return;
    }
  }

  if (_.isUndefined(query)) {
    reply(new Error('invalidQuery'), null);
    return;
  }

  if (_.isString(query.name)) {
    searchQuery.name = new RegExp(query.name, 'i');
  }

  if (_.isArray(query.tags)) {
    searchQuery.tags = {};
    searchQuery.tags.$elemMatch = {};
    searchQuery.tags.$elemMatch.$in = query.tags;
  }

  try {

    if (!_.isUndefined(query.range)) {
      if (
        query.range.lng < -180 || query.range.lng > 180 ||
        query.range.lat < -90 || query.range.lat > 90
      ) {
        throw new Error('invalidCoordinatesError');
      }

      let coordinates = [query.range.lng, query.range.lat];
      let result = await Location.retrieveManyByDist(
        searchQuery, coordinates, query.range.radius, Infinity
      );

      reply(null, { locations: result });
      return;
    }

    let result = await Location.retrieveMany(searchQuery, Infinity);
    reply(null, { locations: result });

  } catch (e) {
    reply(e, null);
  }

};