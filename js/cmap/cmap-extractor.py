# -*- coding: utf-8 -*-
"""

@date: 2025/05/07 11:39:53
@author: jdurbin
@source: VSCode
"""
import os

from matplotlib import colormaps
from matplotlib.colors import ListedColormap

EXTRACT_MESH = True
PRETTY = False
MESH_COLORS = ['viridis', 'inferno']

cmaps: dict[str, ListedColormap] = dict(colormaps)

cm = ListedColormap([
    "#4477AA",
    "#EE6677",
    "#228833",
    "#CCBB44",
    "#66CCEE",
    "#AA3377",
    "#BBBBBB",
], 'Bright')
cm.url = "https://sronpersonalpages.nl/~pault/"
cm.sort = 0
cmaps[cm.name] = cm

cm = ListedColormap([
    "#EE7733",
    "#0077BB",
    "#33BBEE",
    "#EE3377",
    "#CC3311",
    "#009988",
    "#BBBBBB",
], 'Vibrant')
cm.url = "https://sronpersonalpages.nl/~pault/"
cm.sort = 1
cmaps[cm.name] = cm

cm = ListedColormap([
    "#CC6677",
    "#332288",
    "#DDCC77",
    "#117733",
    "#88CCEE",
    "#882255",
    "#44AA99",
    "#999933",
    "#AA4499",
], 'Muted')
cm.url = "https://sronpersonalpages.nl/~pault/"
cm.sort = 2
cmaps[cm.name] = cm

def _sort(cm):
    try:
        return (cm.sort, cm.name)
    except AttributeError:
        return (1e6, cm.name)

smaps = sorted(cmaps.values(), key=_sort)

def _strip(string: str):
    if PRETTY:
        return string
    return string.replace("\t", "").replace("\n", "").replace(" ", "")


class Writer:
    def __init__(self, filename: str, abcName: str, prepend: str, listName: str):
        self.filename = filename
        self.abc = abcName
        self.pre = prepend
        self.names = []
        self.listName = listName

    def __enter__(self):
        self._fw = open(os.path.dirname(__file__) + os.sep + self.filename, 'w+')
        self.write(f"class {self.abc}{'{'}static reversable = true;{'}'}")
        return self

    def write(self, msg):
        self._fw.write(msg)

    def write_cm(self, cm: ListedColormap, name=None):
        if name is None:
            name = cm.name

        self.names.append(self.pre + name)
        self.write(f"\nclass {self.pre}{name} extends {self.abc}{'{'}\n")
        self.write(f"\tstatic name = \"{name}\";\n")
        try:
            url = cm.url
        except AttributeError:
            url = "https://matplotlib.org/stable/users/explain/colors/colormaps.html"
        self.write(f"\tstatic src = \"{url}\";\n")
        cstring = ""
        for i in range(cm.N):
            color = cm(i)
            cstring += f"\t\t[{color[0]}, {color[1]}, {color[2]}],\n"

        self.write("\tstatic colors = " + _strip("[\n" + cstring + "\t];"))
        self.write("\n}")

    def __exit__(self, *a, **kw):
        if (a[0] is None):
            self.write(f"\nexport const {self.listName} = [" + _strip(
                "\n\t"
                + ",\n\t".join(self.names)
                + "\n];"
            ))

        try:
            self._fw.close()
        except Exception:
            pass


listedCMs = set()
with Writer("cmap-listed-colors.js", "ListedCMAPABC", "LCM", "ListedColormaps") as fw:
    for cm in list(smaps):
        name: str = cm.name
        if not isinstance(cm, ListedColormap):
            continue
        if name.endswith('_r'):
            continue
        if (cm.N > 255):
            continue
        listedCMs.add(name)
        fw.write_cm(cm)

if EXTRACT_MESH:
    with Writer("cmap-mesh-colors.js", "MeshCMAPABC", "MCM", "MeshColormaps") as fw:
        names = []
        for name in list(MESH_COLORS):
            if name in listedCMs:
                continue
            if name.endswith('_r'):
                continue
            for cm in smaps:
                if cm.name.lower() == name.lower():
                    fw.write_cm(cm)
