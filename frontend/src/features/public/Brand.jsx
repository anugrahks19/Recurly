import React from 'react';
import { Link } from 'react-router-dom';

export function Brand() {
  return <Link className="brand" to="/" aria-label="Recurly home"><span className="brand-mark"><i /><i /></span><span>Recurly</span></Link>;
}
