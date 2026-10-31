import React, { useState } from 'react';
import { EmptyState, Icon, PageHeader } from '../../../shared/components/Ui.jsx';
import { dateLabel, ErrorView, LoadingView, Notice } from '../components/CustomerUi.jsx';
import { useCustomer } from '../hooks/useCustomer.jsx';
import { customerApi } from '../services/customerApi.js';

const iconFor={payment:'payments',failure:'error',renewal:'event',subscription:'subscriptions',trial:'hourglass_top',invoice:'receipt_long',cancellation:'cancel'};
export function Notifications(){
  const {data,loading,error,refresh}=useCustomer();const [message,setMessage]=useState('');
  if(loading)return <LoadingView/>;if(error||!data)return <ErrorView message={error||'Notifications unavailable.'} retry={refresh}/>;
  async function mark(id){setMessage('');try{await customerApi.markNotificationRead(id);await refresh();}catch(e){setMessage(e.message);}}
  return <div className="page-wrap"><PageHeader eyebrow="Customer view · updates" title="Notifications" description="Payment, renewal, invoice, trial, and subscription updates for your account."/>{message&&<Notice kind="error">{message}</Notice>}
    <section className="panel"><div className="panel-heading"><div><span className="section-mark"><i/><i/></span><h2>Account Updates</h2><span className="subtle-pill">{data.notifications.filter(n=>!n.read).length} Unread</span></div></div>{data.notifications.length?<div className="notification-list">{data.notifications.map(n=><article key={n.id} className={n.read?'':'unread'}><span className="icon-box"><Icon name={iconFor[n.type]||'notifications'}/></span><div><h3>{n.title}</h3><p>{n.detail}</p><small>{dateLabel(n.date)}</small></div>{!n.read&&<button className="table-button" onClick={()=>mark(n.id)}>Mark Read</button>}</article>)}</div>:<EmptyState icon="notifications_none" title="All caught up" text="Important account updates will appear here."/>}</section>
  </div>;
}
