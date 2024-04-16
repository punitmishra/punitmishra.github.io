![Header](./assets/images/github-header-image-pm.png)

# About Punit

## Who am I?
![Me](./assets/images/me.jpeg)

Hello! I'm **Punit**, an Engineer by profession. At **SAP**, where I currently work, I dedicate my days to developing applications, creating scalable infrastructures, and tackling machine learning challenges. Outside of work, I dive into the worlds of **web3**, **blockchain technologies**, and **open hardware**. I'm also an enthusiast of "pi-net" projects, tinkering with Wi-Fi routers, intercepting data packets, and experimenting with electrically powered devices. I hold a Bachelor of Science in **Electrical Engineering and Computer Sciences (EECS)** from the University of California, Berkeley, class of 2012. My sidekick in all these adventures is my beloved dog, Pepper, or as I affectionately call him, Mr. Pepper.

## Life Stories

*Details coming soon... Stay tuned!*

# My Interests

## Programming Languages

- **Rust**, **C**, **Python**, **Go**, **C++**, **Java**, **Scala**  
  Dive into tutorials, recommended readings, clever hacks, and essential debugging techniques.

## DevOps Insights

### Continuous Integration (CI)

- Master the efficiency of **GitHub Actions** for automating your code integration.

### Continuous Deployment (CD)

- *More insights coming soon...*

### Testing

- **API Testing**, **UI Testing**, **Integration Testing**  
  Explore various approaches to ensure your application's reliability and efficiency.

## Systems Architecture and Design

- Domains, TLD mastery, and embracing security with **Let's Encrypt** and SSL/TLS certifications.
- Navigate the intricate **service mesh landscape** with tools like **Istio**.

## Distributed Systems

- Discuss storage solutions, insights with **Apache Spark**, streaming architectures, and the intricacies of **Cassandra**.

## Machine Learning

- *In-depth content to be added soon.*

## Web3 & Blockchain

Explore the ever-evolving cryptoverse:
- **Bitcoin**, **Ethereum**, **Polygon**, **Ripple**, **Blockstack**, **Dogecoin**, **Grepcoin**, **Grepchain**, **IPFS Protocol**

## Open Hardware & Software

- *More content to be unveiled.*

# Building This Site

1. **Repository Magic**: Dive into the creation and management of a GitHub repository.
2. **Navigating Domain Nameservers**: How to configure your domain's nameservers effectively.
3. **Security with HTTPS**: Implementing HTTPS to ensure secure communications.
4. **Testing the Waters**: Rigorous testing methodologies to build robust applications.
5. **Building Resilience**: Strategies for crafting resilient architectural frameworks.
6. **Network Architecture**: Conceptualizing and visualizing high-level network designs.
7. **Functional Assurance**: Techniques for verifying the functionality of your pages.

```bash
echo "Explore the binary text from the header image:"
export BINARY_TXT="01001000 01101001 00100001 00100000 01010100 01101000 01101001 01110011 00100000 01101001 01110011 00100000 01010000 01110101 01101110 01101001 01110100 00101110 00100000 01001001 00100000 01100001 01101110 00100000 01000101 01101110 01100111 01101001 01101110 01100101 01100101 01110010 00101110"
echo "Decode the message:"
echo "$BINARY_TXT" | while read -r a; do printf "%x" "$((2#$a))"; done | xxd -r -p
