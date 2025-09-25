/**
 * @NApiVersion 2.1
 */
define(['N/record', 'N/runtime', 'N/url'], (record, runtime, url) => {
    
  const createMfgRoutingViewUrl = (mfgRoutingId) => {
    const TAG = 'createMfgRoutingViewUrl';

    const getDomainName = () => {
      const TAG = 'getDomainName';
      const accountId = runtime.accountId;
      log.debug(TAG, `accountId: ${accountId}`);

      const domainName = url.resolveDomain({
        hostType: url.HostType.APPLICATION,
        accountId: accountId
      });
      log.debug(TAG, `domainName: ${domainName}`);
      return domainName;
    }

    const domainName = getDomainName();

    const mfgRoutingRecUrl = url.resolveRecord({
      recordType: record.Type.MANUFACTURING_ROUTING,
      recordId: mfgRoutingId,
      isEditMode: false
    });
    log.debug(TAG, `mfgRoutingRecUrl: ${mfgRoutingRecUrl}`);

    const mfgRoutingViewUrl = `https://${domainName}${mfgRoutingRecUrl}`;
    log.debug(TAG, `mfgRoutingViewUrl: ${mfgRoutingViewUrl}`);
    return mfgRoutingViewUrl;
  }

  const setMfgRoutingViewLink = (mfgRoutingId, mfgRoutingViewUrl) => {
    const TAG = 'setMfgRoutingViewLink';
    try {
      // NB! record.submitFields doesn't work
      const mfgRoutingRec = record.load({
        type: record.Type.MANUFACTURING_ROUTING,
        id: mfgRoutingId
      });

      mfgRoutingRec.setValue('custrecord_rs_mfg_routing_view_link', mfgRoutingViewUrl);    

      const savedMfgRoutingId = mfgRoutingRec.save();
      log.debug(TAG, `savedMfgRoutingId: ${savedMfgRoutingId}`);

      return savedMfgRoutingId;

    } catch (e) {
      log.error(TAG, e);
      throw e;
    }
  }

  return {
    createMfgRoutingViewUrl,
    setMfgRoutingViewLink
  }

});
