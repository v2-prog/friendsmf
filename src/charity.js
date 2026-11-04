'use strict';
// The single place that turns the configurable charity status into behaviour.
// Everything else (receipts, GST flags, public wording) asks for capabilities; nothing reads the raw status string.
// To change what a status means, edit capabilities() only.
const settings = require('./settings');
const cfg = require('./config');

const STATUSES = ['none', 'acnc_registered', 'dgr_endorsed'];

function capabilities() {
  let status = settings.get('charity.status');
  if (!STATUSES.includes(status)) status = 'none';
  const dgrDetails = {
    receiptName: settings.get('charity.dgr.receipt_name') || cfg.society.name,
    abn: settings.get('charity.dgr.abn') || cfg.society.abn || '',
    fundName: settings.get('charity.dgr.fund_name') || '',
  };
  const warnings = [];
  const isDgr = status === 'dgr_endorsed';
  if (isDgr && !dgrDetails.abn) warnings.push('Charity status is Deductible gift recipient but no ABN is set, so tax receipts are switched off. Add the ABN in Settings.');
  return {
    status,
    isCharity: status !== 'none',
    isDgr,
    canIssueTaxReceipts: isDgr && !!dgrDetails.abn,
    gstConcessionsPossible: status !== 'none',
    gstRegistered: !!settings.get('charity.gst_registered'),
    fundraisingInputTaxedElection: !!settings.get('charity.fundraising_input_taxed_election'),
    receipt: dgrDetails,
    warnings,
  };
}

function statusLabel(status) {
  return { none: 'Not a registered charity', acnc_registered: 'Registered charity', dgr_endorsed: 'Deductible gift recipient' }[status] || status;
}

module.exports = { capabilities, statusLabel, STATUSES };
