import { Pos } from '../../../entities';
import { IStatsSQLQueryFormatted, IStatsSQLQueryResult } from '../../../types';

export const getStatistics = async () => {
  const queryResult: IStatsSQLQueryResult[] = await Pos.query(`
                    SELECT COUNT(*) AS TOTAL,
                          COUNT(CASE
                                    WHEN "hasMilchshake" = 'AVAILABLE' THEN 1
                                END) AS AVAILABLEMILCHSHAKES,
                          COUNT(CASE
                                    WHEN "hasMilchshake" NOT IN ('UNKNOWN', 'NOT_APPLICABLE') THEN 1
                                END) AS TOTALMILCHSHAKES,
                        MIN("timeSinceBrokenMilchshake") as LONGESTBROKENMILCHSHAKE,
                          COUNT(CASE
                                    WHEN "hasMcFlurry" = 'AVAILABLE' THEN 1
                                END) AS AVAILABLEMCFLURRYS,
                          COUNT(CASE
                                    WHEN "hasMcFlurry" NOT IN ('UNKNOWN', 'NOT_APPLICABLE') THEN 1
                                END) AS TOTALMCFLURRYS,
                          MIN("timeSinceBrokenMcFlurry") as LONGESTBROKENMCFLURRY,
                          COUNT(CASE
                                    WHEN "hasMcSundae" = 'AVAILABLE' THEN 1
                                END) AS AVAILABLEMCSUNDAES,
                          COUNT(CASE
                                    WHEN "hasMcSundae" NOT IN ('UNKNOWN', 'NOT_APPLICABLE') THEN 1
                                END) AS TOTALMCSUNDAES,
                          MIN("timeSinceBrokenMcSundae") as LONGESTBROKENMCSUNDAE,
                          COUNTRY
                    FROM POS
                    GROUP BY COUNTRY`);

  return queryResult.map<IStatsSQLQueryFormatted>((result) => ({
    total: parseInt(result.total, 10) || 0,
    availablemcflurrys: parseInt(result.availablemcflurrys, 10) || 0,
    totalmcflurrys: parseInt(result.totalmcflurrys, 10) || 0,
    availablemcsundaes: parseInt(result.availablemcsundaes, 10) || 0,
    totalmcsundaes: parseInt(result.totalmcsundaes, 10) || 0,
    availablemilchshakes: parseInt(result.availablemilchshakes, 10) || 0,
    totalmilchshakes: parseInt(result.totalmilchshakes, 10) || 0,
    longestbrokenmcflurry: result.longestbrokenmcflurry,
    longestbrokenmcsundae: result.longestbrokenmcsundae,
    longestbrokenmilchshake: result.longestbrokenmilchshake,
    country: result.country,
  }));
};