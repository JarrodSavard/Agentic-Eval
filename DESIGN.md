---
name: Road Test
description: A clear rental booking board for inspecting AI decisions.
colors:
  paper: '#f4f6f4'
  surface: '#fbfcfa'
  ink: '#193442'
  muted: '#566971'
  line: '#d3deda'
  green: '#285d4c'
  green-soft: '#e0ece5'
  amber-soft: '#f4ead7'
  focus: '#35775f'
  action-hover: '#2b4a59'
  secondary-hover: '#e4eae6'
  slot-open: '#eaf0ea'
  slot-existing: '#98a7a2'
  slot-requested: '#44715b'
typography:
  display:
    fontFamily: 'Archivo, sans-serif'
    fontSize: 'clamp(3.9rem, 6.7vw, 6rem)'
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: '-0.035em'
  headline:
    fontFamily: 'Archivo, sans-serif'
    fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)'
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: '-0.025em'
  title:
    fontFamily: 'Archivo, sans-serif'
    fontSize: '1.12rem'
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: 'Archivo, sans-serif'
    fontSize: '15px'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'Archivo, sans-serif'
    fontSize: '0.78rem'
    fontWeight: 400
    lineHeight: 1.6
  code:
    fontFamily: "Consolas, 'Liberation Mono', monospace"
    fontSize: '0.74rem'
    fontWeight: 400
    lineHeight: 1.65
rounded:
  badge: '3px'
  control: '4px'
  table: '5px'
  panel: '7px'
spacing:
  '8': '8px'
  '12': '12px'
  '16': '16px'
  '18': '18px'
  '20': '20px'
  '24': '24px'
  '28': '28px'
  '32': '32px'
  '40': '40px'
  '64': '64px'
components:
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.surface}'
    rounded: '{rounded.control}'
    padding: '12px 19px'
  button-primary-hover:
    backgroundColor: '{colors.action-hover}'
  button-secondary:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '12px 19px'
  button-secondary-hover:
    backgroundColor: '{colors.secondary-hover}'
  select:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '9px 34px 9px 12px'
  navigation:
    textColor: '{colors.muted}'
    padding: '10px 0'
  badge:
    textColor: '{colors.green}'
    rounded: '{rounded.badge}'
    padding: '3px 8px'
  evidence-panel:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.panel}'
  booking-cell:
    backgroundColor: '{colors.slot-open}'
    rounded: '{rounded.badge}'
    width: '24px'
    height: '29px'
  replay-control:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    height: '34px'
---

# Design System: Road Test

## Direction

A calm, readable rental booking desk for understanding how AI handles everyday problems. Keep the existing paper, ink, green and amber palette and Archivo typography. Use a car outline as the brand mark.

## Interface rules

- Customer request first: person, trip, required car feature and allowed dates.
- Show the booking site problem and explain each action in everyday language.
- Label board cells Free, Unavailable, or Booked for the customer. Do not rely on color alone.
- Dates are one-day rentals in October 2026.
- Keep exact requests, responses and provenance under expandable details.
- Preserve keyboard access, mobile scrolling and readable text.
