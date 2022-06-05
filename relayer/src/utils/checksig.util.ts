import EIP712Signature from "./checksig.interface";

var ethUtil = require('ethereumjs-util');
var sigUtil = require('eth-sig-util');

class CheckSigUtil {

    public checkSig(msgParams: any, sig: string, signer: string) : boolean {

        const recovered = sigUtil.recoverTypedSignature({ data: JSON.parse(msgParams), sig: sig })
        if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(signer)) {
            console.log('Correct signer address: ', signer);
            return true;
        } else {
            console.error('Failed to verify signer when comparing ' + recovered + ' to ' + signer)
            return false;
        }
    }

    public getRSV(sig: string) : EIP712Signature {

        //getting r s v from a signature
        const signature = sig.substring(2);
        const r = "0x" + signature.substring(0, 64);
        const s = "0x" + signature.substring(64, 128);
        const v = parseInt(signature.substring(128, 130), 16);
        console.log("r:", r);
        console.log("s:", s);
        console.log("v:", v);

        var ret: EIP712Signature = {
            r: r,
            s: s,
            v: v
        }

        return ret;
    }

}

export default CheckSigUtil;