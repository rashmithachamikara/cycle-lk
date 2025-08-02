import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';


// Import services and interfaces
import { locationService, Location } from '../services/locationService';
import { partnerService } from '../services/partnerService';