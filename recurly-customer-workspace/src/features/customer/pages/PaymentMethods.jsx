import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, Icon, PageHeader } from '../../../shared/components/Ui.jsx';
import { ConfirmDialog, ErrorView, LoadingView, Notice } from '../components/CustomerUi.jsx';
import { useCustomer } from '../hooks/useCustomer.jsx';
import { customerApi } from '../services/customerApi.js';

export function PaymentMethods() {
  const {data,loading,error,refresh,isDemo}=useCustomer();const [message,setMessage]=useState('');const [success,setSuccess]=useState('');const [busy,setBusy]=useState(false);const [remove,setRemove]=useState(null);
  if(loading)return <LoadingView/>;if(error||!data)return <ErrorView message={error||'Payment methods unavailable.'} retry={refresh}/>;
  async function act(fn,successText){setBusy(true);setMessage('');setSuccess('');try{await fn();setSuccess(successText);await refresh();}catch(e){setMessage(e.message);}finally{setBusy(false);setRemove(null);}}
  async function hostedSetup(methodId){setBusy(true);setMessage('');try{const result=methodId?await customerApi.startPaymentMethodUpdate(methodId):await customerApi.startPaymentMethodSetup();const url=new URL(result.redirectUrl);if(url.protocol!=='https:')throw new Error('Secure payment setup URL was not provided.');window.location.assign(url.href);}catch(e){setMessage(e.message);setBusy(false);}}
  return <div className="page-wrap"><Link className="back-link" to="/customer/payments"><Icon name="arrow_back"/> Payment history</Link><PageHeader eyebrow="Customer view · secure billing" title="Payment Methods" description="Choose a default method or add one through the secure payment provider." action={<button className="button button-ochre" onClick={()=>hostedSetup()} disabled={busy}><Icon name="add_card"/> Add Method</button>}/>
    {isDemo&&<Notice>Card entry is handled by a secure payment provider after backend setup. No card details are entered or stored here.</Notice>}{message&&<Notice kind="error">{message}</Notice>}{success&&<Notice kind="success">{success}</Notice>}
    {data.paymentMethods.length?<div className="method-list">{data.paymentMethods.map(method=><article className="panel method-card" key={method.id}><span className="icon-box"><Icon name="credit_card"/></span><div><h2>{method.brand} ending {method.last4}</h2><p>Expires {method.expiry}</p></div><div className="method-actions">{method.isDefault?<span className="subtle-pill">Default</span>:<button className="button button-outline" disabled={busy} onClick={()=>act(()=>customerApi.setDefaultMethod(method.id),'Default method updated.')}>Set Default</button>}<button className="button button-outline" disabled={busy} onClick={()=>hostedSetup(method.id)}>Update</button><button className="button button-danger-outline" disabled={busy||method.isDefault} title={method.isDefault?'Choose another default first':'Remove method'} onClick={()=>setRemove(method)}>Remove</button></div></article>)}</div>:<section className="panel"><EmptyState icon="credit_card_off" title="No payment methods" text="Add a method through the secure payment provider to make purchases."/></section>}
    {remove&&<ConfirmDialog title="Remove payment method?" description={`Remove ${remove.brand} ending ${remove.last4}? You may need another method for future renewals.`} confirmLabel="Remove Method" destructive busy={busy} onClose={()=>setRemove(null)} onConfirm={()=>act(()=>customerApi.removeMethod(remove.id),'Payment method removed.')}/>}
  </div>;
}
