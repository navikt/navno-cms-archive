import React from "react";
import { ToggleGroup } from "@navikt/ds-react"

const viewVariants = ['html', 'json', 'files'] as const;
export type ViewVariant = typeof viewVariants[number]

const getDisplayname = (viewVariant: ViewVariant) => {
  const translations: Record<ViewVariant, string> = {
    html: 'Nettside',
    json: 'JSON',
    files: 'Filer'
  }
  return translations[viewVariant]
}


type Props = {
  selectedView: ViewVariant;
  setSelectedView(selectedView: ViewVariant): void
}

export const ViewSelector = ({ selectedView, setSelectedView }: Props) => {
  return (
    <ToggleGroup size={'small'} value={selectedView} onChange={(e) => setSelectedView(e as ViewVariant)}>
      {viewVariants.map(view => <ToggleGroup.Item key={view} value={view}>{getDisplayname(view)}</ToggleGroup.Item>)}
    </ToggleGroup>
  )
}