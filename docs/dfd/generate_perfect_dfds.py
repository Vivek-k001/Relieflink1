import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle, FancyArrowPatch
from PIL import Image

BASE_DIR = r"c:\Users\User\Videos\Relieflink1\docs\dfd"
os.makedirs(os.path.join(BASE_DIR, "level0"), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "level1"), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "level2"), exist_ok=True)

# ----------------------------------------------------------------------
# Common Drawing Primitives (Classic Textbook Monochrome B&W Style)
# ----------------------------------------------------------------------

def setup_canvas(width=16, height=10):
    fig, ax = plt.subplots(figsize=(width, height), dpi=300)
    ax.set_xlim(0, width)
    ax.set_ylim(0, height)
    ax.axis('off')
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')
    return fig, ax

def draw_header(ax, x, y, title, subtitle):
    ax.text(x, y, title, ha='center', va='center', fontsize=16, fontweight='bold',
            color='black', family='sans-serif', zorder=10)
    ax.text(x, y - 0.42, subtitle, ha='center', va='center', fontsize=10.5, fontstyle='italic',
            color='#333333', family='sans-serif', zorder=10)

def draw_entity(ax, cx, cy, w, h, title, subtitle="", r=0.2):
    # Pure white box, clean black stroke
    box = FancyBboxPatch(
        (cx - w/2, cy - h/2), w, h,
        boxstyle=f"round,pad=0.04,rounding_size={r}",
        facecolor="white", edgecolor="black", linewidth=2.2, zorder=4
    )
    ax.add_patch(box)
    
    if subtitle:
        ax.text(cx, cy + 0.16, title, ha='center', va='center',
                fontsize=11, fontweight='bold', color='black', zorder=5, family='sans-serif')
        ax.text(cx, cy - 0.22, f"({subtitle})", ha='center', va='center',
                fontsize=9.5, fontstyle='italic', color='#333333', zorder=5, family='sans-serif')
    else:
        ax.text(cx, cy, title, ha='center', va='center',
                fontsize=11, fontweight='bold', color='black', zorder=5, family='sans-serif')

def draw_process(ax, cx, cy, radius, pid_text, name_lines):
    # Pure white circle, clean black stroke matching Reference 1 & 2
    circle = Circle((cx, cy), radius, facecolor="white", edgecolor="black", linewidth=2.2, zorder=4)
    ax.add_patch(circle)
    
    if pid_text:
        full_text = f"{pid_text}\n" + "\n".join(name_lines)
    else:
        full_text = "\n".join(name_lines)
        
    ax.text(cx, cy, full_text, ha='center', va='center',
            fontsize=10.5, fontweight='bold', color='black',
            linespacing=1.22, zorder=5, family='sans-serif')

def draw_datastore(ax, cx, cy, w, h, ds_id, name):
    # Classic Gane-Sarson open-ended rectangle: [ ID | Name    
    x0 = cx - w/2
    x1 = cx + w/2
    y0 = cy - h/2
    y1 = cy + h/2
    id_w = 0.85
    
    bg = patches.Rectangle((x0, y0), w, h, facecolor="white", edgecolor="none", zorder=3)
    ax.add_patch(bg)
    
    ax.plot([x0, x1], [y1, y1], color="black", linewidth=2.0, zorder=4)
    ax.plot([x0, x1], [y0, y0], color="black", linewidth=2.0, zorder=4)
    ax.plot([x0, x0], [y0, y1], color="black", linewidth=2.0, zorder=4)
    ax.plot([x0 + id_w, x0 + id_w], [y0, y1], color="black", linewidth=2.0, zorder=4)
    
    ax.text(x0 + id_w/2, cy, ds_id, ha='center', va='center',
            fontsize=10.5, fontweight='bold', color='black', zorder=5, family='sans-serif')
    
    ax.text(x0 + id_w + (w - id_w)/2, cy, name, ha='center', va='center',
            fontsize=9.5, fontweight='bold', color='black', zorder=5, family='sans-serif')

def draw_arrow(ax, start, end, label="", label_pos=0.5, offset=(0, 0.18), ha='center', va='bottom', fontsize=8.5):
    arrow = FancyArrowPatch(
        start, end,
        arrowstyle='-|>,head_length=6.5,head_width=4.2',
        color='black', linewidth=1.7, zorder=2
    )
    ax.add_patch(arrow)
    
    if label:
        lx = start[0] + (end[0] - start[0]) * label_pos + offset[0]
        ly = start[1] + (end[1] - start[1]) * label_pos + offset[1]
        ax.text(lx, ly, label, ha=ha, va=va, fontsize=fontsize,
                fontweight='normal', color='black', family='sans-serif',
                bbox=dict(boxstyle='square,pad=0.2', facecolor='white', edgecolor='none', alpha=0.98),
                zorder=6)

def draw_poly_arrow(ax, points, label="", label_pos=None, ha='center', va='bottom', fontsize=8.5):
    for i in range(len(points) - 2):
        ax.plot([points[i][0], points[i+1][0]], [points[i][1], points[i+1][1]],
                color='black', linewidth=1.7, zorder=2)
    
    arrow = FancyArrowPatch(
        points[-2], points[-1],
        arrowstyle='-|>,head_length=6.5,head_width=4.2',
        color='black', linewidth=1.7, zorder=2
    )
    ax.add_patch(arrow)
    
    if label and label_pos:
        lx, ly = label_pos
        ax.text(lx, ly, label, ha=ha, va=va, fontsize=fontsize,
                fontweight='normal', color='black', family='sans-serif',
                bbox=dict(boxstyle='square,pad=0.2', facecolor='white', edgecolor='none', alpha=0.98),
                zorder=6)


# ----------------------------------------------------------------------
# 1. LEVEL 0: CONTEXT DIAGRAM
# ----------------------------------------------------------------------
def generate_level_0():
    fig, ax = setup_canvas(18, 11)
    draw_header(ax, 9.0, 10.4,
                "Data Flow Diagram - Level 0 (Context Diagram)",
                "System: ReliefLink Disaster Relief & Coordination Network")
    
    # Central Process
    draw_process(ax, 9.0, 5.5, 1.9, "", ["ReliefLink", "Disaster Relief", "System"])
    
    # External Entities
    draw_entity(ax, 2.8, 9.0, 3.4, 1.4, "Affected Citizen", "Evacuee / Victim")
    draw_entity(ax, 15.2, 9.0, 3.6, 1.4, "NGO / Coordinator", "Shelter & Aid Admin")
    draw_entity(ax, 2.8, 2.0, 3.4, 1.4, "Rescue Volunteer", "First Responder")
    draw_entity(ax, 15.2, 2.0, 3.4, 1.4, "Public Donor", "Cash & Goods Contributor")
    draw_entity(ax, 9.0, 1.4, 4.2, 1.2, "Disaster Authority", "Emergency Admin / Govt")
    
    # 1. Affected Citizen Flows
    # Citizen -> System
    draw_poly_arrow(ax, [(4.5, 9.3), (7.8, 9.3), (7.8, 7.3)],
                    label="SOS Request, Live GPS & Needs",
                    label_pos=(6.1, 9.5), ha='center', va='bottom')
    # System -> Citizen
    draw_poly_arrow(ax, [(7.1, 5.2), (2.8, 5.2), (2.8, 8.3)],
                    label="Rescue Mission Status & Shelter Directions",
                    label_pos=(5.0, 5.4), ha='center', va='bottom')
    
    # 2. NGO / Camp Coordinator Flows
    # NGO -> System
    draw_poly_arrow(ax, [(13.4, 9.3), (10.2, 9.3), (10.2, 7.3)],
                    label="Camp Occupancy & Shortage Demands",
                    label_pos=(11.8, 9.5), ha='center', va='bottom')
    # System -> NGO
    draw_poly_arrow(ax, [(10.9, 5.2), (15.2, 5.2), (15.2, 8.3)],
                    label="Evacuee Inflow & Allocated Supplies",
                    label_pos=(13.0, 5.4), ha='center', va='bottom')
    
    # 3. Rescue Volunteer Flows
    # Volunteer -> System
    draw_poly_arrow(ax, [(2.8, 2.7), (2.8, 4.0), (7.1, 4.0)],
                    label="Live Location & Mission Availability",
                    label_pos=(5.0, 4.2), ha='center', va='bottom')
    # System -> Volunteer
    draw_poly_arrow(ax, [(7.7, 3.8), (7.7, 2.0), (4.5, 2.0)],
                    label="Triage SOS Alert & Routing GPS",
                    label_pos=(6.1, 2.2), ha='center', va='bottom')
    
    # 4. Public Donor Flows
    # Donor -> System
    draw_poly_arrow(ax, [(15.2, 2.7), (15.2, 4.0), (10.9, 4.0)],
                    label="Monetary & Verified Relief Goods",
                    label_pos=(13.0, 4.2), ha='center', va='bottom')
    # System -> Donor
    draw_poly_arrow(ax, [(10.3, 3.8), (10.3, 2.0), (13.5, 2.0)],
                    label="Receipt & Nearest Camp Verification Map",
                    label_pos=(11.9, 2.2), ha='center', va='bottom')
    
    # 5. Disaster Authority Flows
    # Authority -> System
    draw_arrow(ax, (8.4, 2.0), (8.4, 3.6),
               label="Weather Alerts & Directives",
               label_pos=0.5, offset=(-0.15, 0), ha='right', va='center')
    # System -> Authority
    draw_arrow(ax, (9.6, 3.6), (9.6, 2.0),
               label="Incident Reports & SOS Heatmap",
               label_pos=0.5, offset=(0.15, 0), ha='left', va='center')
    
    out_path = os.path.join(BASE_DIR, "level0", "dfd_level_0.png")
    plt.tight_layout()
    plt.savefig(out_path, facecolor='white', dpi=300)
    plt.close()
    print("Level 0 generated successfully.")


# ----------------------------------------------------------------------
# 2. LEVEL 1: FUNCTIONAL DECOMPOSITION
# ----------------------------------------------------------------------
def generate_level_1():
    fig, ax = setup_canvas(20, 14.5)
    draw_header(ax, 10.0, 13.9,
                "Data Flow Diagram - Level 1 (Functional Decomposition)",
                "Processes 1.0 to 6.0 and Core Data Stores D1 to D7")
    
    # Row 1 Processes (y = 10.2)
    draw_process(ax, 3.8, 10.2, 1.35, "1.0", ["Authentication", "& Role Access"])
    draw_process(ax, 10.0, 10.2, 1.35, "2.0", ["SOS Rescue", "Triage & Dispatch"])
    draw_process(ax, 16.2, 10.2, 1.35, "3.0", ["Relief Request", "& Aid Matching"])
    
    # Row 2 Processes (y = 5.8)
    draw_process(ax, 3.8, 5.8, 1.35, "4.0", ["Shelter Camp", "& Capacity Track"])
    draw_process(ax, 10.0, 5.8, 1.35, "5.0", ["Geo-Proximity", "Donation Routing"])
    draw_process(ax, 16.2, 5.8, 1.35, "6.0", ["Disaster Alert", "& Broadcast"])
    
    # Data Stores Row 1 (y = 8.0)
    draw_datastore(ax, 1.6, 8.0, 2.8, 0.75, "D1", "Users Store")
    draw_datastore(ax, 10.0, 8.0, 3.2, 0.75, "D2", "SOS Requests Store")
    draw_datastore(ax, 18.4, 8.0, 2.8, 0.75, "D3", "Relief Needs Store")
    
    # Data Stores Row 2 (y = 1.8)
    draw_datastore(ax, 3.8, 1.8, 3.2, 0.75, "D4", "Relief Camps Store")
    draw_datastore(ax, 8.2, 1.8, 3.0, 0.75, "D5", "Donations Ledger")
    draw_datastore(ax, 12.0, 1.8, 3.0, 0.75, "D6", "Camp Inventory Store")
    draw_datastore(ax, 16.2, 1.8, 3.2, 0.75, "D7", "Disaster Alerts")
    
    # Process 1.0 -> D1
    draw_poly_arrow(ax, [(2.7, 9.4), (1.6, 9.4), (1.6, 8.4)],
                    label="User Credentials & Roles",
                    label_pos=(1.6, 9.6), ha='center', va='bottom')
    
    # Process 2.0 -> D2
    draw_arrow(ax, (10.0, 8.85), (10.0, 8.4),
               label="Record SOS Incident & Priority",
               label_pos=0.5, offset=(0, 0), ha='center', va='center')
    
    # Process 2.0 reads D1 (Active Volunteers) - clean top overhead corridor
    draw_poly_arrow(ax, [(9.0, 11.3), (9.0, 12.4), (1.6, 12.4), (1.6, 8.4)],
                    label="Query Active Nearby Volunteers",
                    label_pos=(5.3, 12.6), ha='center', va='bottom')
    
    # Process 2.0 -> Process 4.0 (Shelter admission demand)
    draw_poly_arrow(ax, [(8.9, 9.4), (6.2, 9.4), (6.2, 6.6), (5.15, 6.6)],
                    label="Evacuee Shelter Demand",
                    label_pos=(6.2, 7.8), ha='center', va='bottom')
    
    # Process 3.0 -> D3
    draw_poly_arrow(ax, [(17.3, 9.4), (18.4, 9.4), (18.4, 8.4)],
                    label="Log Relief Demands",
                    label_pos=(18.4, 9.6), ha='center', va='bottom')
    
    # Process 3.0 reads D6 (Inventory) via right-side corridor
    draw_poly_arrow(ax, [(17.55, 10.2), (19.4, 10.2), (19.4, 2.6), (13.0, 2.6), (13.0, 2.2)],
                    label="Check Stock Levels for Matching",
                    label_pos=(19.4, 5.8), ha='center', va='bottom')
    
    # Process 4.0 -> D4 (Capacity Update)
    draw_arrow(ax, (3.8, 4.45), (3.8, 2.2),
               label="Update Headcount & Status",
               label_pos=0.5, offset=(-0.15, 0), ha='right', va='center')
    
    # Process 5.0 reads D4 (proximity) via clean horizontal channel
    draw_poly_arrow(ax, [(5.4, 1.8), (6.6, 1.8), (6.6, 5.3), (8.65, 5.3)],
                    label="Camp GPS & Headcount Needs",
                    label_pos=(6.6, 3.6), ha='right', va='center')
    
    # Process 5.0 -> D5 (Donations)
    draw_poly_arrow(ax, [(9.3, 4.45), (8.2, 3.2), (8.2, 2.2)],
                    label="Record Verified Donation",
                    label_pos=(8.2, 3.4), ha='center', va='bottom')
    
    # Process 5.0 -> D6 (Inventory)
    draw_poly_arrow(ax, [(10.7, 4.45), (11.8, 3.2), (11.8, 2.2)],
                    label="Allocate Supply Stock",
                    label_pos=(11.8, 3.4), ha='center', va='bottom')
    
    # Process 6.0 -> D7
    draw_arrow(ax, (16.2, 4.45), (16.2, 2.2),
               label="Publish Weather Warning Alerts",
               label_pos=0.5, offset=(0.15, 0), ha='left', va='center')
    
    out_path = os.path.join(BASE_DIR, "level1", "dfd_level_1.png")
    plt.tight_layout()
    plt.savefig(out_path, facecolor='white', dpi=300)
    plt.close()
    print("Level 1 generated successfully.")


# ----------------------------------------------------------------------
# 3. LEVEL 2: PROCESS 2.0 (LIVE SOS RESCUE PIPELINE)
# ----------------------------------------------------------------------
def generate_level_2_sos():
    fig, ax = setup_canvas(17, 10.5)
    draw_header(ax, 8.5, 10.0,
                "Data Flow Diagram - Level 2 (Process 2.0: SOS Rescue Pipeline)",
                "Sub-Processes 2.1 to 2.4: Signal Capture, Urgency Triage, Volunteer Dispatch & Shelter Admission")
    
    # External Entities
    draw_entity(ax, 2.0, 8.0, 2.8, 1.4, "Trapped Citizen", "Victim in Distress")
    draw_entity(ax, 14.8, 2.2, 2.8, 1.4, "Rescue Volunteer", "First Responder")
    
    # Sub-Processes
    draw_process(ax, 5.8, 8.0, 1.35, "2.1", ["Capture GPS &", "Distress Signal"])
    draw_process(ax, 11.2, 8.0, 1.35, "2.2", ["Urgency Severity", "Triage Ranking"])
    draw_process(ax, 11.2, 4.6, 1.35, "2.3", ["Proximity Volunteer", "Matching & Alert"])
    draw_process(ax, 5.8, 4.6, 1.35, "2.4", ["Rescue Tracking &", "Shelter Admission"])
    
    # Data Stores
    draw_datastore(ax, 8.5, 6.3, 3.4, 0.75, "D2", "SOS Requests")
    draw_datastore(ax, 14.8, 4.6, 2.8, 0.75, "D1", "Users (Volunteers)")
    draw_datastore(ax, 2.0, 4.6, 2.8, 0.75, "D4", "Relief Camps")
    
    # Citizen -> 2.1
    draw_arrow(ax, (3.4, 8.0), (4.45, 8.0),
               label="SOS Call, GPS & Family Count",
               label_pos=0.5, offset=(0, 0.2), ha='center', va='bottom')
    
    # 2.1 -> D2
    draw_arrow(ax, (6.6, 7.0), (7.4, 6.6),
               label="Write Pending Record",
               label_pos=0.5, offset=(-0.25, 0.25), ha='center', va='bottom')
    
    # 2.1 -> 2.2
    draw_arrow(ax, (7.15, 8.0), (9.85, 8.0),
               label="Incident Vulnerability Details",
               label_pos=0.5, offset=(0, 0.2), ha='center', va='bottom')
    
    # 2.2 -> D2
    draw_arrow(ax, (10.4, 7.0), (9.6, 6.6),
               label="Update Urgency: Critical",
               label_pos=0.5, offset=(0.25, 0.25), ha='center', va='bottom')
    
    # 2.2 -> 2.3
    draw_arrow(ax, (11.2, 6.65), (11.2, 5.95),
               label="Trigger Dispatch Event",
               label_pos=0.5, offset=(0.15, 0), ha='left', va='center')
    
    # 2.3 <-> D1
    draw_arrow(ax, (12.55, 4.6), (13.4, 4.6),
               label="Filter Active Radius",
               label_pos=0.5, offset=(0, 0.2), ha='center', va='bottom')
    
    # 2.3 -> Volunteer
    draw_poly_arrow(ax, [(11.6, 3.25), (11.6, 2.2), (13.4, 2.2)],
                    label="Audible Alarm & Navigation Route",
                    label_pos=(11.6, 2.8), ha='right', va='center')
    
    # Volunteer -> 2.4
    draw_poly_arrow(ax, [(14.8, 1.5), (5.8, 1.5), (5.8, 3.25)],
                    label="Accept Mission -> En Route -> Rescued",
                    label_pos=(9.5, 1.7), ha='center', va='bottom')
    
    # 2.4 -> D2
    draw_arrow(ax, (6.6, 5.6), (7.4, 6.0),
               label="Status: Rescued",
               label_pos=0.5, offset=(-0.25, -0.22), ha='center', va='top')
    
    # 2.4 -> D4
    draw_arrow(ax, (4.45, 4.6), (3.4, 4.6),
               label="Admit Evacuee Count",
               label_pos=0.5, offset=(0, 0.2), ha='center', va='bottom')
    
    out_path = os.path.join(BASE_DIR, "level2", "dfd_level_2_sos.png")
    plt.tight_layout()
    plt.savefig(out_path, facecolor='white', dpi=300)
    plt.close()
    print("Level 2 SOS generated successfully.")


# ----------------------------------------------------------------------
# 4. LEVEL 2: PROCESS 5.0 (GEO-SMART DONATION ROUTING)
# ----------------------------------------------------------------------
def generate_level_2_donation():
    fig, ax = setup_canvas(17, 10.5)
    draw_header(ax, 8.5, 10.0,
                "Data Flow Diagram - Level 2 (Process 5.0: Geo-Smart Donation Routing)",
                "Sub-Processes 5.1 to 5.3: Haversine Calculation, Payment Processing & Inventory Ledger")
    
    # External Entities
    draw_entity(ax, 2.0, 7.8, 2.8, 1.4, "Public Donor", "Online Contributor")
    draw_entity(ax, 14.8, 7.8, 2.8, 1.4, "Payment Gateway", "UPI / Card Simulator")
    
    # Sub-Processes
    draw_process(ax, 6.0, 7.8, 1.35, "5.1", ["Haversine Distance", "& Need Scoring"])
    draw_process(ax, 10.8, 7.8, 1.35, "5.2", ["Payment & Goods", "Validation Check"])
    draw_process(ax, 8.4, 3.2, 1.35, "5.3", ["Camp Inventory &", "Receipt Verification"])
    
    # Data Stores
    draw_datastore(ax, 6.0, 5.5, 3.2, 0.75, "D4", "Relief Camps")
    draw_datastore(ax, 10.8, 5.5, 3.2, 0.75, "D5", "Donations Ledger")
    draw_datastore(ax, 14.0, 3.2, 3.2, 0.75, "D6", "Camp Inventory")
    
    # Donor -> 5.1
    draw_arrow(ax, (3.4, 7.8), (4.65, 7.8),
               label="Donor Live GPS & Intent",
               label_pos=0.5, offset=(0, 0.2), ha='center', va='bottom')
    
    # 5.1 <-> D4
    draw_arrow(ax, (6.0, 6.45), (6.0, 5.9),
               label="Camp GPS & Headcount",
               label_pos=0.5, offset=(0.15, 0), ha='left', va='center')
    
    # 5.1 -> 5.2
    draw_arrow(ax, (7.35, 7.8), (9.45, 7.8),
               label="Target Critical Camp ID",
               label_pos=0.5, offset=(0, 0.2), ha='center', va='bottom')
    
    # 5.2 -> Payment Gateway
    draw_arrow(ax, (12.15, 8.2), (13.4, 8.2),
               label="Submit Amount",
               label_pos=0.5, offset=(0, 0.18), ha='center', va='bottom')
    
    # Payment Gateway -> 5.2
    draw_arrow(ax, (13.4, 7.4), (12.15, 7.4),
               label="Auth Confirmation",
               label_pos=0.5, offset=(0, -0.2), ha='center', va='top')
    
    # 5.2 -> D5
    draw_arrow(ax, (10.8, 6.45), (10.8, 5.9),
               label="Record Verified Donation",
               label_pos=0.5, offset=(0.15, 0), ha='left', va='center')
    
    # D5 -> 5.3
    draw_arrow(ax, (10.0, 5.1), (8.9, 4.5),
               label="Verified Goods / Funds Token",
               label_pos=0.5, offset=(0.35, 0.2), ha='left', va='bottom')
    
    # 5.3 -> D6
    draw_arrow(ax, (9.75, 3.2), (12.4, 3.2),
               label="Update Camp Stock",
               label_pos=0.5, offset=(0, 0.2), ha='center', va='bottom')
    
    # 5.3 -> Donor
    draw_poly_arrow(ax, [(7.05, 3.2), (2.0, 3.2), (2.0, 7.1)],
                    label="Receipt, Live Map & Nearest Camp Distance",
                    label_pos=(4.5, 3.4), ha='center', va='bottom')
    
    out_path = os.path.join(BASE_DIR, "level2", "dfd_level_2_donation.png")
    plt.tight_layout()
    plt.savefig(out_path, facecolor='white', dpi=300)
    plt.close()
    print("Level 2 Donation generated successfully.")


# ----------------------------------------------------------------------
# 5. COMPILE ALL DIAGRAMS INTO HIGH-RES PDF DOCUMENTATION
# ----------------------------------------------------------------------
def compile_pdf():
    img_l0 = Image.open(os.path.join(BASE_DIR, "level0", "dfd_level_0.png")).convert("RGB")
    img_l1 = Image.open(os.path.join(BASE_DIR, "level1", "dfd_level_1.png")).convert("RGB")
    img_l2_sos = Image.open(os.path.join(BASE_DIR, "level2", "dfd_level_2_sos.png")).convert("RGB")
    img_l2_don = Image.open(os.path.join(BASE_DIR, "level2", "dfd_level_2_donation.png")).convert("RGB")
    
    pdf_path = os.path.join(BASE_DIR, "ReliefLink_DFD_Documentation.pdf")
    img_l0.save(pdf_path, save_all=True, append_images=[img_l1, img_l2_sos, img_l2_don], quality=95)
    print(f"Compiled PDF successfully at {pdf_path}")

if __name__ == "__main__":
    generate_level_0()
    generate_level_1()
    generate_level_2_sos()
    generate_level_2_donation()
    compile_pdf()
