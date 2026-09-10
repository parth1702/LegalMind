const mongoose = require('mongoose');

/**
 * Embedded Risk Subdocument Schema
 */
const riskItemSchema = new mongoose.Schema({
  clauseTitle: { type: String, trim: true, default: '' },
  riskType: {
    type: String,
    enum: ['liability', 'compliance', 'termination', 'ambiguity', 'financial', 'other'],
    default: 'other',
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
  },
  description: { type: String, required: true },
  recommendation: { type: String, default: '' },
  pageNumber: { type: Number, default: 1 },
});

/**
 * Embedded Clause Subdocument Schema
 */
const clauseItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  category: { type: String, default: 'General' },
  complianceStatus: {
    type: String,
    enum: ['compliant', 'warning', 'non-compliant', 'review-needed'],
    default: 'compliant',
  },
});

/**
 * Analysis Schema — Holds legal extraction results, risk scoring, entities & key clauses.
 */
const analysisSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Analysis must be linked to a Document'],
      unique: true, // One primary analysis per document
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Analysis must be linked to a User'],
      index: true,
    },
    summary: {
      type: String,
      default: '',
    },
    riskScore: {
      type: Number,
      min: [0, 'Risk score cannot be less than 0'],
      max: [100, 'Risk score cannot exceed 100'],
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
      index: true,
    },
    risks: [riskItemSchema],
    keyEntities: {
      parties: [{ type: String, trim: true }],
      dates: [
        {
          label: { type: String, trim: true },
          dateValue: { type: Date },
          rawText: { type: String },
        },
      ],
      governingLaw: { type: String, default: '' },
      monetaryValues: [
        {
          amount: { type: Number },
          currency: { type: String, default: 'USD' },
          context: { type: String },
        },
      ],
    },
    filename: {
      type: String,
      default: '',
    },
    confidence: {
      type: Number,
      default: 0.90,
      min: 0,
      max: 1,
    },
    categoryScores: {
      type: Map,
      of: Number,
      default: {},
    },
    recommendations: [{ type: String }],
    evidence: [
      {
        ruleId: { type: String, default: '' },
        category: { type: String, default: '' },
        severity: { type: String, default: 'low' },
        finding: { type: String, default: '' },
        evidenceText: { type: String, default: '' },
        page: { type: Number, default: 1 },
        chunkId: { type: String, default: 'chunk-1' },
        startChar: { type: Number, default: 0 },
        endChar: { type: Number, default: 0 },
        confidence: { type: Number, default: 0.90 },
        recommendation: { type: String, default: '' },
      },
    ],
    aiModelVersion: {
      type: String,
      default: 'v2.4.0 (Evidence-Backed Legal Engine)',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
analysisSchema.index({ user: 1, createdAt: -1 });

const Analysis =
  mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;
