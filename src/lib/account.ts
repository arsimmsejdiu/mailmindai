import type {EmailHeader, EmailMessage, SyncResponse, SyncUpdatedResponse } from "@/lib/types";
import { db } from "@/server/db";
import axios from "axios";

const API_BASE_URL = 'https://api.aurinko.io/v1';

