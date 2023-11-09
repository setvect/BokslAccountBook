import React, { useEffect, useRef, useState } from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { Col, Container, Nav, Navbar, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/style.css';

function Hello() {
  // 추가: 전역 스타일을 위한 CSS-in-JS

  return (
    <div className="container-scroller">
      <Nav className="sidebar sidebar-offcanvas" id="sidebar">
        <div className="sidebar-brand-wrapper d-none d-lg-flex align-items-center justify-content-center fixed-top">
          <a className="sidebar-brand brand-logo" href="index.html">
            <img src="assets/images/logo.svg" alt="logo" />
          </a>
          <a className="sidebar-brand brand-logo-mini" href="index.html">
            <img src="assets/images/logo-mini.svg" alt="logo" />
          </a>
        </div>
        <ul className="nav">
          <li className="nav-item nav-category" />
          <li className="nav-item menu-items">
            <a className="nav-link" href="index.html">
              <span className="menu-icon">
                <i className="mdi mdi-speedometer" />
              </span>
              <span className="menu-title">Dashboard</span>
            </a>
          </li>
          <li className="nav-item menu-items">
            <a className="nav-link" data-toggle="collapse" href="#ui-basic" aria-expanded="false" aria-controls="ui-basic">
              <span className="menu-icon">
                <i className="mdi mdi-laptop" />
              </span>
              <span className="menu-title">Basic UI Elements</span>
              <i className="menu-arrow" />
            </a>
            <div className="collapse" id="ui-basic">
              <ul className="nav flex-column sub-menu">
                <li className="nav-item">
                  <a className="nav-link" href="pages/ui-features/buttons.html">
                    Buttons
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="pages/ui-features/dropdowns.html">
                    Dropdowns
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="pages/ui-features/typography.html">
                    Typography
                  </a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </Nav>
      <div className="container-fluid page-body-wrapper">
        <nav className="navbar p-0 fixed-top d-flex flex-row">
          <div className="navbar-brand-wrapper d-flex d-lg-none align-items-center justify-content-center">
            <a className="navbar-brand brand-logo-mini" href="index.html">
              <img src="assets/images/logo-mini.svg" alt="logo" />
            </a>
          </div>
          <div className="navbar-menu-wrapper flex-grow d-flex align-items-stretch">
            <button className="navbar-toggler navbar-toggler align-self-center" type="button" data-toggle="minimize">
              <span className="mdi mdi-menu" />
            </button>
            <ul className="navbar-nav w-100" />
            <ul className="navbar-nav navbar-nav-right">
              <li className="nav-item dropdown">
                <a className="nav-link" id="profileDropdown" href="#" data-toggle="dropdown">
                  <div className="navbar-profile">
                    <img className="img-xs rounded-circle" src="assets/images/faces/face15.jpg" alt="" />
                    <p className="mb-0 d-none d-sm-block navbar-profile-name">복슬이</p>
                    <i className="mdi mdi-menu-down d-none d-sm-block" />
                  </div>
                </a>
                <div className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="profileDropdown">
                  <div className="dropdown-divider" />
                  <a className="dropdown-item preview-item">
                    <div className="preview-thumbnail">
                      <div className="preview-icon bg-dark rounded-circle">
                        <i className="mdi mdi-settings text-success" />
                      </div>
                    </div>
                    <div className="preview-item-content">
                      <p className="preview-subject mb-1">Settings</p>
                    </div>
                  </a>
                  <div className="dropdown-divider" />
                  <a className="dropdown-item preview-item">
                    <div className="preview-thumbnail">
                      <div className="preview-icon bg-dark rounded-circle">
                        <i className="mdi mdi-logout text-danger" />
                      </div>
                    </div>
                    <div className="preview-item-content">
                      <p className="preview-subject mb-1">Log out</p>
                    </div>
                  </a>
                </div>
              </li>
            </ul>
            <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-toggle="offcanvas">
              <span className="mdi mdi-format-line-spacing" />
            </button>
          </div>
        </nav>
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="page-header">
              <h3 className="page-title">달력 입력</h3>
            </div>
            <div className="row" />
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">내용11</div>
                </div>
              </div>
            </div>
          </div>
          <footer className="footer">
            <div className="d-sm-flex justify-content-center justify-content-sm-between" />
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // CSS-in-JS를 사용하여 전역 스타일 적용
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
