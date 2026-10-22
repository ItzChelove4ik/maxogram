"""Verify a device IPA and copy it to a predictable download filename."""

import argparse
import plistlib
import shutil
import struct
from pathlib import Path
from zipfile import ZipFile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("search_root", type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    candidates = list(args.search_root.rglob("*.ipa"))
    if len(candidates) != 1:
        raise SystemExit(f"Expected one IPA, found {len(candidates)}: {candidates}")
    source = candidates[0]
    with ZipFile(source) as archive:
        corrupt = archive.testzip()
        if corrupt:
            raise SystemExit(f"Corrupt archive entry: {corrupt}")
        app_plists = [
            name for name in archive.namelist()
            if name.startswith("Payload/")
            and name.endswith(".app/Info.plist")
            and name.count("/") == 2
        ]
        if len(app_plists) != 1:
            raise SystemExit(f"Expected one app in Payload: {app_plists}")
        info = plistlib.loads(archive.read(app_plists[0]))
        if info.get("CFBundleSupportedPlatforms") != ["iPhoneOS"]:
            raise SystemExit("IPA is not an iPhone device build")
        app_root = app_plists[0].rsplit("/", 1)[0]
        executable = info["CFBundleExecutable"]
        with archive.open(f"{app_root}/{executable}") as binary:
            header = binary.read(8)
        if len(header) != 8:
            raise SystemExit("Missing Mach-O header")
        magic, cpu = struct.unpack("<II", header)
        if magic != 0xFEEDFACF or cpu != 0x0100000C:
            raise SystemExit(f"Expected ARM64 Mach-O binary, got {header.hex()}")
        print(f"Validated {info['CFBundleIdentifier']} {info['CFBundleShortVersionString']} (iPhoneOS ARM64)")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, args.output)
    print(f"IPA: {args.output} ({args.output.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
