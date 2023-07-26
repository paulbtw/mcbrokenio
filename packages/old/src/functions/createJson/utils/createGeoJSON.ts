import { getColorDot } from './getDotColor';
import { Pos } from '../../../entities';

export const createGeoJSON = async () => {
  const allPos = await Pos.find();

  const json = allPos.map((pos) => {
    const dot = getColorDot(
      pos.hasMilchshake,
      pos.hasMcSundae,
      pos.hasMcFlurry,
    );
    return {
      geometry: {
        coordinates: [Number(pos.longitude), Number(pos.latitude), 0],
        type: 'Point',
      },
      properties: {
        hasMilchshake: pos.hasMilchshake,
        timeSinceBrokenMilchshake: pos.timeSinceBrokenMilchshake
          ? new Date(pos.timeSinceBrokenMilchshake).getTime()
          : pos.timeSinceBrokenMilchshake,
        hasMcSundae: pos.hasMcSundae,
        timeSinceBrokenMcSundae: pos.timeSinceBrokenMcSundae
          ? new Date(pos.timeSinceBrokenMcSundae).getTime()
          : null,
        hasMcFlurry: pos.hasMcFlurry,
        timeSinceBrokenMcFlurry: pos.timeSinceBrokenMcFlurry
          ? new Date(pos.timeSinceBrokenMcFlurry).getTime()
          : pos.timeSinceBrokenMcFlurry,
        lastChecked: new Date(pos.lastCheck).getTime(),
        name: pos.name,
        dot,
        open: pos.restaurantStatus,
        hasMobileOrdering: pos.hasMobileOrdering,
      },
      type: 'Feature',
    };
  });

  const finalJson = {
    type: 'FeatureCollection',
    features: json,
  };

  return finalJson;
};
