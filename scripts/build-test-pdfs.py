"""Build original MCA notes and an image-only PDF for Runware OCR testing."""
from pathlib import Path
from shutil import copyfile
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from pypdf import PdfReader
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[1]
OUT, TMP, ASSETS = ROOT / 'output/pdf', ROOT / 'tmp/pdfs', ROOT / 'src/assets/notes'
for folder in (OUT, TMP, ASSETS):
    folder.mkdir(parents=True, exist_ok=True)
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='LessonTitle', fontName='Helvetica-Bold', fontSize=22, leading=27, textColor=colors.HexColor('#116149'), spaceAfter=18))
styles['BodyText'].fontSize, styles['BodyText'].leading = 11, 16
styles['BodyText'].spaceAfter = 10
styles['Heading2'].textColor = colors.HexColor('#116149')

def footer(c, doc):
    c.setFont('Helvetica', 9)
    c.setFillColor(colors.HexColor('#64746e'))
    c.drawString(46, 28, 'NOTESBHEJDE / MCA REVISION')
    c.drawRightString(549, 28, f'Page {doc.page}')

def build(path, pages):
    story = []
    for index, (title, sections) in enumerate(pages):
        if index:
            story.append(PageBreak())
        story.append(Paragraph(title, styles['LessonTitle']))
        for heading, text in sections:
            story.extend([Paragraph(heading, styles['Heading2']), Paragraph(text, styles['BodyText']), Spacer(1, 5)])
    SimpleDocTemplate(str(path), pagesize=(595, 842), leftMargin=46, rightMargin=46, topMargin=45, bottomMargin=48).build(story, onFirstPage=footer, onLaterPages=footer)

build(OUT / 'mca-networks.pdf', [
    ('Computer Networks: TCP/IP', [
        ('1. Layered communication', 'The four-layer TCP/IP model separates application, transport, internet and link responsibilities. HTTP and DNS are application protocols; TCP and UDP are transport protocols; IP handles addressing and routing; Ethernet is a link technology. Encapsulation adds protocol information as data travels down the stack.'),
        ('2. TCP versus UDP', 'TCP provides a reliable, ordered byte stream using sequence numbers, acknowledgements and retransmissions. It also supports flow control and congestion control. TCP does not preserve application message boundaries, so applications need their own framing. UDP sends independent datagrams without built-in delivery or ordering guarantees. Applications may implement reliability above UDP.'),
        ('3. Connection establishment', 'A typical TCP connection begins with SYN, SYN-ACK and ACK. This handshake synchronizes sequence numbers. TCP reliability does not guarantee that a disconnected application will receive data indefinitely or that an application has processed received bytes.'),
        ('4. Addressing and names', 'An IP address identifies a network interface in a routing context. A transport port identifies an application endpoint. DNS resolves names to records, including address records. In IPv4, ARP resolves a local next-hop IPv4 address to a link-layer address; it does not resolve domain names.'),
        ('5. Switching and routing', 'A typical Ethernet switch forwards frames using MAC addresses. A router forwards packets between IP networks. To reach a remote subnet, a host normally sends its frame to the default gateway, not directly to the remote destination MAC address.'),
        ('Exam checks', 'Explain why TCP needs application framing. Distinguish DNS from ARP. Compare reliability, ordering and message boundaries in TCP and UDP. Avoid claiming UDP is always faster: performance depends on the application and network.')
    ]),
    ('IPv4 Subnetting: Worked Example', [
        ('1. Prefix and host bits', 'IPv4 addresses contain 32 bits. A /26 prefix uses 26 network bits and leaves 6 host bits. The mask is 255.255.255.192. Each /26 block contains 2^6 = 64 addresses. For an ordinary /26 subnet, 62 are usable host addresses after excluding network and broadcast addresses.'),
        ('2. Split a /24 into /26 subnets', 'Borrowing two bits from 192.168.10.0/24 creates four /26 subnets. Their network addresses are 192.168.10.0, 192.168.10.64, 192.168.10.128 and 192.168.10.192. The block size in the last octet is 64.'),
        ('3. Locate a host', 'For 192.168.10.70/26, 70 falls in the 64-127 block. Network: 192.168.10.64. Broadcast: 192.168.10.127. Usable range: 192.168.10.65 through 192.168.10.126. Host .70 and host .100 are in the same /26; host .130 is not.'),
        ('4. Choosing a subnet size', 'To support at least 50 ordinary host interfaces, choose h with 2^h - 2 at least 50. Six host bits give 62 usable addresses, so /26 is sufficient. Five host bits give only 30, so /27 is insufficient.'),
        ('5. Important exceptions', 'The subtract-two rule applies to conventional subnets, not every prefix. A /31 can use both addresses on a point-to-point link, and /32 denotes one address. Do not apply the /26 host rule mechanically to those cases.'),
        ('Practice with answer check', 'For 192.168.10.150/26, find network, broadcast and usable range. Answer: network .128, broadcast .191, usable .129-.190. Explain why .150 and .70 are in different subnets even though their first three octets match.')
    ])
])
build(TMP / 'mca-se-source.pdf', [
    ('Software Engineering: SDLC', [
        ('1. Lifecycle activities', 'Typical activities include requirements analysis, design, implementation, testing, deployment and maintenance. These activities may repeat or overlap. Waterfall emphasizes sequential phases; iterative development revisits and improves the product through repeated cycles. Agile favors incremental delivery and feedback, not the absence of planning or documentation.'),
        ('2. Requirements', 'Functional requirements describe behavior: a student can upload a PDF note. Non-functional requirements describe qualities or constraints: the upload accepts at most 20 MB, or responses meet a defined performance target. Requirements should be testable and should include relevant conditions.'),
        ('3. Verification and validation', 'Verification checks whether work products satisfy their specifications: are we building the product right? Validation checks whether the product meets user needs: are we building the right product? Reviews and tests can support these activities; verification is not simply a synonym for testing.'),
        ('4. Testing levels', 'Unit tests check individual components. Integration tests check interactions between components. System tests check the complete integrated product. Acceptance tests assess readiness against user or business acceptance criteria. These levels describe scope, not necessarily a single rigid execution order.'),
        ('5. Masterji integration example', 'A unit test checks the greeting classifier. An integration test checks the chat API with a mocked provider. An end-to-end test opens a PDF, asks a question and verifies the visible response. Mocked tests alone cannot prove the real provider and deployed app work together.')
    ]),
    ('Testing: Techniques &amp; Examples', [
        ('1. Black-box and white-box', 'Black-box tests derive cases from externally visible behavior without depending on implementation details. White-box tests use internal structure, such as branches or paths. High code coverage is useful evidence but does not guarantee correct requirements or defect-free software.'),
        ('2. Equivalence partitioning', 'Suppose a form accepts integer marks from 0 through 100 inclusive. Partitions include valid integers 0-100, integers below 0, integers above 100, and invalid types such as non-numeric text. Choose representative cases from each relevant partition.'),
        ('3. Boundary value analysis', 'For the marks field, test -1, 0, 1, 99, 100 and 101. These probe the lower and upper edges and neighboring values. Also check empty input and non-integers if the specification forbids them. Passing 50 alone does not test boundary handling.'),
        ('4. Regression and smoke tests', 'Regression testing checks that changes have not broken previously working behavior. Smoke testing checks critical paths to decide whether a build is suitable for further testing. A smoke suite is not a substitute for comprehensive regression coverage.'),
        ('5. Defect reporting', 'A useful report includes environment, prerequisites, reproducible steps, expected result, actual result and evidence. Severity measures impact; priority concerns when to address the defect. A severe issue and an urgent issue need not be the same.'),
        ('Exam practice', 'Design boundary tests for an allowed file size of 1-20 MB inclusive. Distinguish system testing from acceptance testing. Explain why 100 percent statement coverage does not prove every branch or requirement has been tested.')
    ])
])
source = pdfium.PdfDocument(str(TMP / 'mca-se-source.pdf'))
scanned = canvas.Canvas(str(OUT / 'mca-software-engineering-ocr.pdf'), pagesize=(595, 842))
for page in source:
    image = page.render(scale=2).to_pil()
    scanned.drawImage(ImageReader(image), 0, 0, width=595, height=842)
    scanned.showPage()
scanned.save()
source.close()
for name in ('mca-networks.pdf', 'mca-software-engineering-ocr.pdf'):
    copyfile(OUT / name, ASSETS / name)
    doc = pdfium.PdfDocument(str(OUT / name))
    for i in range(len(doc)):
        doc[i].render(scale=1).to_pil().save(TMP / f'{name[:-4]}-{i+1}.png')
    doc.close()
    reader = PdfReader(OUT / name)
    count = sum(len(page.extract_text() or '') for page in reader.pages)
    assert (count == 0) if 'ocr' in name else (count > 2000)
    print(f'{name}: {len(reader.pages)} pages, {count} extractable characters')
