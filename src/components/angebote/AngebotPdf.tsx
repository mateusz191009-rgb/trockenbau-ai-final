"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { Eye, EyeOff, Download, Loader2 } from "lucide-react";

// Web-spezifische Komponenten nur clientseitig laden (kein SSR).
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
  { ssr: false },
);
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false },
);

export interface AngebotPdfPosition {
  pos: number;
  bezeichnung: string;
  beschreibung: string;
  menge: string;
  einheit: string;
  einzelpreis: string;
  summe: string;
}

export interface AngebotPdfDaten {
  firma: {
    name: string;
    zeilen: string[];
    telefon: string;
    email: string;
    website: string;
    ustId: string;
  };
  logoUrl: string | null;
  kunde: {
    name: string;
    ansprechpartner: string;
    adresseZeilen: string[];
  };
  baustelle: string;
  nummer: string;
  datum: string;
  titel: string;
  leistungsbeschreibung: string;
  positionen: AngebotPdfPosition[];
  netto: string;
  mwstBetrag: string;
  brutto: string;
}

export interface AngebotPdfLabels {
  offer: string;
  offerNumber: string;
  date: string;
  customer: string;
  site: string;
  pos: string;
  description: string;
  qty: string;
  unit: string;
  unitPrice: string;
  total: string;
  net: string;
  vat: string;
  gross: string;
  serviceDescription: string;
  paymentTerms: string;
  paymentTermsText: string;
  validityText: string;
  thanks: string;
  vatId: string;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0f172a",
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  logo: { width: 130, maxHeight: 60, objectFit: "contain" },
  companyName: { fontSize: 15, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  companyLine: { fontSize: 9, color: "#475569" },
  metaBox: { textAlign: "right" },
  metaTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 6,
  },
  metaLine: { fontSize: 9, color: "#475569" },
  parties: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  partyBlock: { width: "48%" },
  label: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  strong: { fontFamily: "Helvetica-Bold" },
  title: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    marginTop: 6,
  },
  paragraph: { fontSize: 10, color: "#1e293b", marginBottom: 16 },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    color: "#ffffff",
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    fontSize: 9.5,
  },
  cPos: { width: "7%" },
  cDesc: { width: "45%" },
  cQty: { width: "12%", textAlign: "right" },
  cUnit: { width: "12%", textAlign: "right" },
  cPrice: { width: "12%", textAlign: "right" },
  cSum: { width: "12%", textAlign: "right" },
  posDesc: { fontSize: 8, color: "#64748b", marginTop: 1 },
  totals: { marginTop: 14, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", width: "55%", justifyContent: "space-between", paddingVertical: 2 },
  totalLabel: { fontSize: 10, color: "#475569" },
  totalValue: { fontSize: 10, textAlign: "right" },
  grandRow: {
    flexDirection: "row",
    width: "55%",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: "#1e293b",
  },
  grandLabel: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  grandValue: { fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "right" },
  footerBlock: { marginTop: 26 },
  footerText: { fontSize: 9, color: "#475569", marginBottom: 4 },
  pageNumber: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
  },
});

function AngebotDokument({
  daten,
  labels,
}: {
  daten: AngebotPdfDaten;
  labels: AngebotPdfLabels;
}) {
  return (
    <Document title={`${labels.offer} ${daten.nummer}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {daten.logoUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image style={styles.logo} src={daten.logoUrl} />
            ) : (
              <Text style={styles.companyName}>{daten.firma.name}</Text>
            )}
            {daten.logoUrl ? (
              <Text style={[styles.companyName, { marginTop: 6 }]}>
                {daten.firma.name}
              </Text>
            ) : null}
            {daten.firma.zeilen.map((z, i) => (
              <Text key={i} style={styles.companyLine}>
                {z}
              </Text>
            ))}
            {daten.firma.telefon ? (
              <Text style={styles.companyLine}>{daten.firma.telefon}</Text>
            ) : null}
            {daten.firma.email ? (
              <Text style={styles.companyLine}>{daten.firma.email}</Text>
            ) : null}
            {daten.firma.website ? (
              <Text style={styles.companyLine}>{daten.firma.website}</Text>
            ) : null}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaTitle}>{labels.offer}</Text>
            <Text style={styles.metaLine}>
              {labels.offerNumber}: {daten.nummer}
            </Text>
            <Text style={styles.metaLine}>
              {labels.date}: {daten.datum}
            </Text>
            {daten.firma.ustId ? (
              <Text style={styles.metaLine}>
                {labels.vatId}: {daten.firma.ustId}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.parties}>
          <View style={styles.partyBlock}>
            <Text style={styles.label}>{labels.customer}</Text>
            <Text style={styles.strong}>{daten.kunde.name}</Text>
            {daten.kunde.ansprechpartner ? (
              <Text>{daten.kunde.ansprechpartner}</Text>
            ) : null}
            {daten.kunde.adresseZeilen.map((z, i) => (
              <Text key={i}>{z}</Text>
            ))}
          </View>
          {daten.baustelle ? (
            <View style={styles.partyBlock}>
              <Text style={styles.label}>{labels.site}</Text>
              <Text>{daten.baustelle}</Text>
            </View>
          ) : null}
        </View>

        {daten.titel ? <Text style={styles.title}>{daten.titel}</Text> : null}
        {daten.leistungsbeschreibung ? (
          <>
            <Text style={styles.label}>{labels.serviceDescription}</Text>
            <Text style={styles.paragraph}>{daten.leistungsbeschreibung}</Text>
          </>
        ) : null}

        <View style={styles.tableHead}>
          <Text style={styles.cPos}>{labels.pos}</Text>
          <Text style={styles.cDesc}>{labels.description}</Text>
          <Text style={styles.cQty}>{labels.qty}</Text>
          <Text style={styles.cUnit}>{labels.unit}</Text>
          <Text style={styles.cPrice}>{labels.unitPrice}</Text>
          <Text style={styles.cSum}>{labels.total}</Text>
        </View>
        {daten.positionen.map((p) => (
          <View key={p.pos} style={styles.row} wrap={false}>
            <Text style={styles.cPos}>{p.pos}</Text>
            <View style={styles.cDesc}>
              <Text>{p.bezeichnung}</Text>
              {p.beschreibung ? (
                <Text style={styles.posDesc}>{p.beschreibung}</Text>
              ) : null}
            </View>
            <Text style={styles.cQty}>{p.menge}</Text>
            <Text style={styles.cUnit}>{p.einheit}</Text>
            <Text style={styles.cPrice}>{p.einzelpreis}</Text>
            <Text style={styles.cSum}>{p.summe}</Text>
          </View>
        ))}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{labels.net}</Text>
            <Text style={styles.totalValue}>{daten.netto}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{labels.vat}</Text>
            <Text style={styles.totalValue}>{daten.mwstBetrag}</Text>
          </View>
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>{labels.gross}</Text>
            <Text style={styles.grandValue}>{daten.brutto}</Text>
          </View>
        </View>

        <View style={styles.footerBlock}>
          <Text style={styles.label}>{labels.paymentTerms}</Text>
          <Text style={styles.footerText}>{labels.paymentTermsText}</Text>
          <Text style={styles.footerText}>{labels.validityText}</Text>
          <Text style={[styles.footerText, { marginTop: 8 }]}>
            {labels.thanks}
          </Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${daten.firma.name} · ${labels.offer} ${daten.nummer} · ${pageNumber}/${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

interface AngebotPdfProps {
  daten: AngebotPdfDaten;
  labels: AngebotPdfLabels;
  fileName: string;
  ui: {
    downloadPdf: string;
    preparingPdf: string;
    showPreview: string;
    hidePreview: string;
  };
}

export function AngebotPdf({ daten, labels, fileName, ui }: AngebotPdfProps) {
  const [mounted, setMounted] = React.useState(false);
  const [vorschau, setVorschau] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const doc = <AngebotDokument daten={daten} labels={labels} />;

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        {ui.preparingPdf}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <PDFDownloadLink
          document={doc}
          fileName={fileName}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-500 px-5 text-base font-semibold text-white transition-colors hover:bg-brand-600"
        >
          {({ loading }) => (
            <>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              {loading ? ui.preparingPdf : ui.downloadPdf}
            </>
          )}
        </PDFDownloadLink>

        <button
          type="button"
          onClick={() => setVorschau((v) => !v)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {vorschau ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
          {vorschau ? ui.hidePreview : ui.showPreview}
        </button>
      </div>

      {vorschau ? (
        <div className="h-[75vh] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <PDFViewer width="100%" height="100%" showToolbar>
            {doc}
          </PDFViewer>
        </div>
      ) : null}
    </div>
  );
}
