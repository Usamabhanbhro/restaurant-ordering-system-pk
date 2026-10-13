"use client";

import React from "react";
import { Drawer } from "vaul";
import { ScanQrScreen } from "./ScanQrScreen";

export interface TableQrScannerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  venueName?: string | undefined;
  onTableSelected?:
    | ((tableContext: { zoneSlug: string; tableNumber: string; zoneName: string }) => void)
    | undefined;
}

export function TableQrScannerSheet({
  isOpen,
  onClose,
  tenantSlug,
  venueName,
  onTableSelected,
}: TableQrScannerSheetProps) {
  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md" />
        <Drawer.Content className="fixed inset-0 z-50 max-w-md mx-auto bg-[#0C0F17] text-white flex flex-col focus:outline-none overflow-hidden shadow-2xl">
          <ScanQrScreen
            onClose={onClose}
            tenantSlug={tenantSlug}
            venueName={venueName}
            onTableSelected={onTableSelected}
          />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default TableQrScannerSheet;
