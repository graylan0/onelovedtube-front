import React from 'react';
import { NavLink } from 'react-router-dom'

import './tag-list.css';

export function TagList() {
	return (
		<section className="top-tag-list">
      <NavLink exact to={'/'} className="top-tag top-tag-1" activeClassName="nav-selected">HOME</NavLink>
      		</section>
	)
}