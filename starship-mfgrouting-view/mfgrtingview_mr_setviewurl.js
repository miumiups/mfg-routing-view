/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/runtime', 'N/search', './mfgrtingview_cm_utilities'], (runtime, search, myUtil) => {
  // SB: https://6978148-sb1.app.netsuite.com/app/common/scripting/scriptrecord.nl?id=54080
  const mfgRoutingId = 593;

  // This script will be run only one time in a known domain/environment, hence hardcoding these values for efficiency
  const DOMAIN_ID_SB = '6978148-sb1';
  const DOMAIN_ID_PROD = '6978148';
  const URL_TEMPLATE = '.app.netsuite.com/app/accounting/manufacturing/mfgrouting.nl?id=';

  /**
   * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
   * @param {Object} inputContext
   * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
   *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
   * @param {Object} inputContext.ObjectRef - Object that references the input data
   * @typedef {Object} ObjectRef
   * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
   * @property {string} ObjectRef.type - Type of the record instance that contains the input data
   * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
   * @since 2015.2
   */
  const getInputData = (inputContext) => {
    const TAG = 'getInputData';
    const mfgRoutings = [];
    let domainId = DOMAIN_ID_SB;
    try {

      if (runtime.envType === runtime.EnvType.PRODUCTION) {
        domainId = DOMAIN_ID_PROD;
      }

      search.create({
        type: search.Type.MANUFACTURING_ROUTING
        // filters: []
      }).run().each(result => {
        const mfgRoutingId = result.id;
        const mfgRoutingViewUrl = `https://${domainId}${URL_TEMPLATE}${mfgRoutingId}`;
        const mfgRouting = {
          mfgRoutingId: mfgRoutingId,
          mfgRoutingViewUrl: mfgRoutingViewUrl
        };
        mfgRoutings.push(mfgRouting);
        return true;
        // return false;
      });

      log.debug(TAG, `mfgRoutings(${mfgRoutings.length}): ${JSON.stringify(mfgRoutings)}`);

      return mfgRoutings;
    } catch (e) {
      log.error(TAG, e);
    }
  }

  /**
   * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
   * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
   * context.
   * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
   *     is provided automatically based on the results of the getInputData stage.
   * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
   *     function on the current key-value pair
   * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
   *     pair
   * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
   *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
   * @param {string} mapContext.key - Key to be processed during the map stage
   * @param {string} mapContext.value - Value to be processed during the map stage
   * @since 2015.2
   */
  const map = (mapContext) => {
    const TAG = 'map';
    try {

      const {mfgRoutingId, mfgRoutingViewUrl} = JSON.parse(mapContext.value);
      log.debug(TAG, `mfgRoutingId: ${mfgRoutingId}`);
      log.debug(TAG, `mfgRoutingViewUrl: ${mfgRoutingViewUrl}`);

      const savedMfgRoutingId = myUtil.setMfgRoutingViewLink(mfgRoutingId, mfgRoutingViewUrl);

      mapContext.write({
        key: mfgRoutingId,
        value: savedMfgRoutingId
      });

    } catch (e) {
      log.error(TAG, e);
    }
  }

  // /**
  //  * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
  //  * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
  //  * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
  //  *     provided automatically based on the results of the map stage.
  //  * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
  //  *     reduce function on the current group
  //  * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
  //  * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
  //  *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
  //  * @param {string} reduceContext.key - Key to be processed during the reduce stage
  //  * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
  //  *     for processing
  //  * @since 2015.2
  //  */
  // const reduce = (reduceContext) => {

  // }

  /**
   * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
   * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
   * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
   * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
   *     script
   * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
   * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
   *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
   * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
   * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
   * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
   *     script
   * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
   * @param {Object} summaryContext.inputSummary - Statistics about the input stage
   * @param {Object} summaryContext.mapSummary - Statistics about the map stage
   * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
   * @since 2015.2
   */
  const summarize = (summaryContext) => {
    const TAG = 'summarize';
    let iterationCount = 0;
    let mfgRoutingIdCount = 0;
    let savedMfgRoutingIdCount = 0;
    const errorMsgRoutingIds = [];
    try {

      summaryContext.output.iterator().each((key, value) => {
        iterationCount++;

        if (key) { 
          mfgRoutingIdCount++; 
        }
        if (value) {
          savedMfgRoutingIdCount++;
        } else {
          errorMsgRoutingIds.push(key);
        }
        
        return true;
      });

      log.audit(TAG, `iterationCount: ${iterationCount} | mfgRoutingIdCount: ${mfgRoutingIdCount} | savedMfgRoutingIdCount: ${savedMfgRoutingIdCount}`);
      log.audit(TAG, `errorMsgRoutingIds(${errorMsgRoutingIds.length}): ${JSON.stringify(errorMsgRoutingIds)}`);
    } catch (e) {
      log.error(TAG, e);
    }
  }

  return {
    getInputData, 
    map, 
    // reduce, 
    summarize
  }

});
