/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['./mfgrtingview_cm_utilities'], (myUtil) => {

  // /**
  //  * Defines the function definition that is executed before record is loaded.
  //  * @param {Object} context
  //  * @param {Record} context.newRecord - New record
  //  * @param {string} context.type - Trigger type; use values from the context.UserEventType enum
  //  * @param {Form} context.form - Current form
  //  * @param {ServletRequest} context.request - HTTP request information sent from the browser for a client action only.
  //  * @since 2015.2
  //  */
  // const beforeLoad = (context) => {

  // }

  // /**
  //  * Defines the function definition that is executed before record is submitted.
  //  * @param {Object} context
  //  * @param {Record} context.newRecord - New record
  //  * @param {Record} context.oldRecord - Old record
  //  * @param {string} context.type - Trigger type; use values from the context.UserEventType enum
  //  * @since 2015.2
  //  */
  // const beforeSubmit = (context) => {

  // }

  /**
   * Defines the function definition that is executed after record is submitted.
   * @param {Object} context
   * @param {Record} context.newRecord - New record
   * @param {Record} context.oldRecord - Old record
   * @param {string} context.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  const afterSubmit = (context) => {
    const TAG = 'afterSubmit';
    try {
      log.debug('context.type', context.type);
      log.debug('context.newRecord', context.newRecord);

      if (context.type !== 'create') {
        return;
      }

      const mfgRoutingId = context.newRecord.id;
      const mfgRoutingViewUrl = myUtil.createMfgRoutingViewUrl(mfgRoutingId);
      myUtil.setMfgRoutingViewLink(mfgRoutingId, mfgRoutingViewUrl);

    } catch (e) {
      log.error(TAG, e);
      // throw e;
    }
  }

  return {
    // beforeLoad, 
    // beforeSubmit, 
    afterSubmit
  }

});
