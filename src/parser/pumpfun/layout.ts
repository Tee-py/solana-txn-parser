import { struct } from '@solana/buffer-layout';
import { CreateEvent, TradeEvent, CompleteEvent } from './types';
import { stringLayout, pubKey, uint64, boolean } from '../../core';

export const CREATE_EVENT_LAYOUT = struct<CreateEvent>([
    stringLayout('name'),
    stringLayout('symbol'),
    stringLayout('uri'),
    pubKey('mint'),
    pubKey('bondingCurve'),
    pubKey('user'),
]);

export const TRADE_EVENT_LAYOUT = struct<TradeEvent>([
    pubKey('mint'),
    uint64('solAmount'),
    uint64('tokenAmount'),
    boolean('isBuy'),
    pubKey('user'),
    uint64('timestamp'),
    uint64('virtualSolReserves'),
    uint64('virtualTokenReserves'),
]);

export const COMPLETE_EVENT_LAYOUT = struct<CompleteEvent>([
    pubKey('user'),
    pubKey('mint'),
    pubKey('bondingCurve'),
    uint64('timestamp'),
]);
